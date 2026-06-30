(function () {
  'use strict';

  var LIBYA_BBOX = { west: 9.0, south: 19.0, east: 26.0, north: 34.0 };
  var LIBYA_CENTER = [27.0, 17.5];

  var map = L.map('leafletMap').setView(LIBYA_CENTER, 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  var facilitiesLayer = L.layerGroup().addTo(map);
  var hotspotsLayer = L.layerGroup().addTo(map);

  // ---- NOC facilities layer ----
  window.NOC_FACILITIES_DATA.facilities.forEach(function (f) {
    var marker = L.circleMarker([f.lat, f.lng], {
      radius: 7,
      color: '#2dd4bf',
      fillColor: '#2dd4bf',
      fillOpacity: 0.6,
      weight: 2
    });
    marker.bindPopup(
      '<strong>' + f.name + '</strong><br>' +
      f.subsidiary + '<br>' +
      '<em>' + f.type + '</em>' +
      (f.note ? '<br><small>' + f.note + '</small>' : '') +
      '<br><small>Indicative location — verify against primary sources.</small>'
    );
    marker.addTo(facilitiesLayer);
  });

  document.getElementById('toggleFacilities').addEventListener('change', function (e) {
    if (e.target.checked) map.addLayer(facilitiesLayer);
    else map.removeLayer(facilitiesLayer);
  });
  document.getElementById('toggleHotspots').addEventListener('change', function (e) {
    if (e.target.checked) map.addLayer(hotspotsLayer);
    else map.removeLayer(hotspotsLayer);
  });

  // ---- NASA FIRMS hotspots layer ----
  var firmsStatus = document.getElementById('firmsStatus');
  var firmsKeyInput = document.getElementById('firmsKey');
  var savedKey = window.localStorage.getItem('firmsMapKey') || window.FIRMS_DEFAULT_MAP_KEY;
  if (savedKey) firmsKeyInput.value = savedKey;

  document.getElementById('firmsKeySave').addEventListener('click', function () {
    var key = firmsKeyInput.value.trim();
    if (!key) {
      firmsStatus.textContent = 'Enter a MAP_KEY first.';
      return;
    }
    window.localStorage.setItem('firmsMapKey', key);
    loadHotspots(key);
  });

  if (savedKey) loadHotspots(savedKey);

  function loadHotspots(key) {
    firmsStatus.textContent = 'Loading hotspots…';
    hotspotsLayer.clearLayers();

    var bbox = [LIBYA_BBOX.west, LIBYA_BBOX.south, LIBYA_BBOX.east, LIBYA_BBOX.north].join(',');
    var firmsUrl = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/' + encodeURIComponent(key) +
      '/VIIRS_SNPP_NRT/' + bbox + '/7';

    if (window.location.protocol === 'file:') {
      firmsStatus.textContent = 'This page is open from a local file (file://) — browsers block cross-origin requests from file:// pages. Serve the page over http(s) (e.g. the GitHub Pages link) to load live hotspots.';
      return;
    }

    // FIRMS' area/csv endpoint frequently omits CORS headers, which makes a direct
    // browser fetch() fail with an opaque network error before the response (and any
    // real HTTP status / key error) is ever seen. Try direct first, then fall back
    // through CORS relays so a real error (bad key, no data) can actually surface.
    fetchText(firmsUrl)
      .catch(function () {
        return fetchText('https://corsproxy.io/?url=' + encodeURIComponent(firmsUrl));
      })
      .catch(function () {
        return fetchText('https://api.allorigins.win/raw?url=' + encodeURIComponent(firmsUrl));
      })
      .then(function (csvText) {
        if (/^\s*<!DOCTYPE|^\s*<html/i.test(csvText)) {
          throw new Error('Received an HTML error page instead of CSV — MAP_KEY is likely invalid or rate-limited.');
        }
        var rows = parseCsv(csvText);
        if (!rows.length) {
          firmsStatus.textContent = 'No hotspots in the last 7 days for this area (key worked, zero detections).';
          return;
        }
        rows.forEach(function (row) {
          var lat = parseFloat(row.latitude);
          var lng = parseFloat(row.longitude);
          if (isNaN(lat) || isNaN(lng)) return;
          var marker = L.circleMarker([lat, lng], {
            radius: 4,
            color: '#ff7a45',
            fillColor: '#ff7a45',
            fillOpacity: 0.7,
            weight: 1
          });
          marker.bindPopup(
            '<strong>Thermal hotspot</strong><br>' +
            'Date: ' + (row.acq_date || 'n/a') + ' ' + (row.acq_time || '') + '<br>' +
            'Brightness: ' + (row.bright_ti4 || row.brightness || 'n/a') + '<br>' +
            'FRP: ' + (row.frp || 'n/a') + '<br>' +
            'Confidence: ' + (row.confidence || 'n/a') +
            '<br><small>Source: NASA FIRMS VIIRS. Proxy signal only — not a confirmed flare.</small>'
          );
          marker.addTo(hotspotsLayer);
        });
        firmsStatus.textContent = rows.length + ' hotspots loaded (last 7 days).';
      })
      .catch(function (err) {
        console.error(err);
        firmsStatus.textContent = 'Failed to load FIRMS data: ' + err.message;
      });
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  function parseCsv(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    var out = [];
    for (var i = 1; i < lines.length; i++) {
      var cells = lines[i].split(',');
      if (cells.length !== headers.length) continue;
      var obj = {};
      headers.forEach(function (h, idx) { obj[h] = cells[idx]; });
      out.push(obj);
    }
    return out;
  }

  // ---- World Bank flaring trend chart ----
  (function () {
      var data = window.WORLDBANK_FLARING_DATA;
      var years = data.series.map(function (d) { return d.year; });
      var values = data.series.map(function (d) { return d.bcm; });

      var ctx = document.getElementById('trendChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: 'Libya gas flaring volume (bcm)',
            data: values,
            borderColor: '#ff7a45',
            backgroundColor: 'rgba(255,122,69,0.15)',
            tension: 0.2,
            spanGaps: false,
            pointRadius: 5
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#e6edf3' } },
            tooltip: {
              callbacks: {
                afterLabel: function (ctx) {
                  var d = data.series[ctx.dataIndex];
                  return d.source + (d.approx ? ' (approx.)' : '');
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: '#93a1ab' }, grid: { color: '#2a3744' } },
            y: { ticks: { color: '#93a1ab' }, grid: { color: '#2a3744' }, title: { display: true, text: 'bcm', color: '#93a1ab' } }
          }
        }
      });

      var milestonesEl = document.getElementById('milestones');
      (data.milestones || []).forEach(function (m) {
        var div = document.createElement('div');
        div.className = 'milestone';
        div.innerHTML = '<div class="m-date">' + m.date + '</div>' +
          '<div>' + m.label + '</div>' +
          '<small>' + m.detail + ' — ' + m.source + '</small>';
        milestonesEl.appendChild(div);
      });
  })();
})();
