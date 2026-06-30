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
  fetch('data/noc_facilities.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      data.facilities.forEach(function (f) {
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
    })
    .catch(function (err) { console.error('Failed to load NOC facilities', err); });

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
  var savedKey = window.localStorage.getItem('firmsMapKey');
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
    var url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/' + encodeURIComponent(key) +
      '/VIIRS_SNPP_NRT/' + bbox + '/7';

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (csvText) {
        var rows = parseCsv(csvText);
        if (!rows.length) {
          firmsStatus.textContent = 'No hotspots returned (or invalid key).';
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
        firmsStatus.textContent = 'Failed to load FIRMS data (check your MAP_KEY).';
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
  fetch('data/worldbank_flaring.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
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
    })
    .catch(function (err) { console.error('Failed to load flaring trend data', err); });
})();
