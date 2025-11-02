/**
 * Bakery Service Providers Data Fetcher for Libya
 * Uses OpenStreetMap Overpass API to fetch real bakery data
 */

class LibyaBakeryFetcher {
    constructor() {
        this.overpassUrl = 'https://overpass-api.de/api/interpreter';
        this.bakeries = [];
        this.categories = new Set();
        this.loadingElement = null;
        this.resultsElement = null;
    }

    /**
     * Initialize the fetcher with DOM elements
     */
    init(loadingElementId, resultsElementId) {
        this.loadingElement = document.getElementById(loadingElementId);
        this.resultsElement = document.getElementById(resultsElementId);
    }

    /**
     * Build Overpass QL query for bakeries in Libya
     */
    buildOverpassQuery() {
        // Query for all bakery-related amenities in Libya
        // Libya bounding box: approximately [9.3, 19.5, 25.2, 33.2] (min_lon, min_lat, max_lon, max_lat)
        return `
            [out:json][timeout:60];
            (
              // Bakeries
              node["shop"="bakery"](19.5,9.3,33.2,25.2);
              way["shop"="bakery"](19.5,9.3,33.2,25.2);
              relation["shop"="bakery"](19.5,9.3,33.2,25.2);

              // Pastry shops
              node["shop"="pastry"](19.5,9.3,33.2,25.2);
              way["shop"="pastry"](19.5,9.3,33.2,25.2);

              // Confectionery
              node["shop"="confectionery"](19.5,9.3,33.2,25.2);
              way["shop"="confectionery"](19.5,9.3,33.2,25.2);

              // Bakery craft
              node["craft"="bakery"](19.5,9.3,33.2,25.2);
              way["craft"="bakery"](19.5,9.3,33.2,25.2);
            );
            out body;
            >;
            out skel qt;
        `;
    }

    /**
     * Categorize a bakery based on its tags
     */
    categorizeBakery(tags) {
        const categories = [];

        if (tags.shop === 'bakery') categories.push('Bakery');
        if (tags.shop === 'pastry') categories.push('Pastry Shop');
        if (tags.shop === 'confectionery') categories.push('Confectionery');
        if (tags.craft === 'bakery') categories.push('Artisan Bakery');

        // Additional categorization based on products
        if (tags['bakery:products']) {
            const products = tags['bakery:products'].split(';');
            if (products.includes('bread')) categories.push('Bread Bakery');
            if (products.includes('cake')) categories.push('Cake Shop');
            if (products.includes('pastry')) categories.push('Pastry Shop');
        }

        // Check for organic/halal certifications
        if (tags.organic === 'yes') categories.push('Organic Bakery');
        if (tags.halal === 'yes') categories.push('Halal Certified');

        return categories.length > 0 ? categories : ['General Bakery'];
    }

    /**
     * Fetch bakery data from Overpass API
     */
    async fetchBakeries() {
        try {
            this.showLoading('Fetching bakery data from OpenStreetMap...');

            const query = this.buildOverpassQuery();
            const response = await fetch(this.overpassUrl, {
                method: 'POST',
                body: query,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.processData(data);

            this.showLoading(`Found ${this.bakeries.length} bakery providers!`);
            return this.bakeries;

        } catch (error) {
            this.showError(`Error fetching data: ${error.message}`);
            throw error;
        }
    }

    /**
     * Process the raw Overpass API data
     */
    processData(data) {
        this.bakeries = [];
        this.categories = new Set();

        if (!data.elements || data.elements.length === 0) {
            console.log('No bakeries found in the data');
            return;
        }

        data.elements.forEach(element => {
            if (element.tags) {
                const bakery = this.extractBakeryInfo(element);
                if (bakery) {
                    this.bakeries.push(bakery);
                    bakery.categories.forEach(cat => this.categories.add(cat));
                }
            }
        });

        console.log(`Processed ${this.bakeries.length} bakeries`);
        console.log(`Found categories:`, Array.from(this.categories));
    }

    /**
     * Extract relevant information from an OSM element
     */
    extractBakeryInfo(element) {
        const tags = element.tags;

        // Get coordinates
        let lat, lon;
        if (element.lat && element.lon) {
            lat = element.lat;
            lon = element.lon;
        } else if (element.center) {
            lat = element.center.lat;
            lon = element.center.lon;
        }

        const bakery = {
            id: element.id,
            type: element.type,
            name: tags.name || tags['name:ar'] || tags['name:en'] || 'Unnamed Bakery',
            nameArabic: tags['name:ar'] || tags.name || '',
            nameEnglish: tags['name:en'] || '',
            categories: this.categorizeBakery(tags),
            address: this.buildAddress(tags),
            city: tags['addr:city'] || tags.city || '',
            phone: tags.phone || tags['contact:phone'] || '',
            website: tags.website || tags['contact:website'] || '',
            email: tags.email || tags['contact:email'] || '',
            openingHours: tags.opening_hours || '',
            latitude: lat,
            longitude: lon,
            shopType: tags.shop || tags.craft || '',
            brand: tags.brand || '',
            halal: tags.halal === 'yes',
            organic: tags.organic === 'yes',
            osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
            rawTags: tags
        };

        return bakery;
    }

    /**
     * Build address string from tags
     */
    buildAddress(tags) {
        const parts = [];

        if (tags['addr:street']) parts.push(tags['addr:street']);
        if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
        if (tags['addr:district']) parts.push(tags['addr:district']);
        if (tags['addr:city']) parts.push(tags['addr:city']);

        return parts.length > 0 ? parts.join(', ') : '';
    }

    /**
     * Get all unique categories
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Filter bakeries by category
     */
    filterByCategory(category) {
        if (!category || category === 'all') {
            return this.bakeries;
        }
        return this.bakeries.filter(bakery =>
            bakery.categories.includes(category)
        );
    }

    /**
     * Export data as JSON
     */
    exportAsJSON() {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalCount: this.bakeries.length,
            categories: this.getCategories(),
            bakeries: this.bakeries
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `libya-bakeries-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Export data as CSV
     */
    exportAsCSV() {
        const headers = [
            'ID', 'Name', 'Name (Arabic)', 'Categories', 'Address', 'City',
            'Phone', 'Website', 'Email', 'Opening Hours',
            'Latitude', 'Longitude', 'Shop Type', 'Brand',
            'Halal', 'Organic', 'OSM URL'
        ];

        const rows = this.bakeries.map(b => [
            b.id,
            b.name,
            b.nameArabic,
            b.categories.join('; '),
            b.address,
            b.city,
            b.phone,
            b.website,
            b.email,
            b.openingHours,
            b.latitude,
            b.longitude,
            b.shopType,
            b.brand,
            b.halal ? 'Yes' : 'No',
            b.organic ? 'Yes' : 'No',
            b.osmUrl
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `libya-bakeries-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Display loading message
     */
    showLoading(message) {
        if (this.loadingElement) {
            this.loadingElement.textContent = message;
            this.loadingElement.style.display = 'block';
        }
    }

    /**
     * Display error message
     */
    showError(message) {
        if (this.loadingElement) {
            this.loadingElement.textContent = message;
            this.loadingElement.style.color = '#e74c3c';
        }
    }

    /**
     * Get statistics about the collected data
     */
    getStatistics() {
        return {
            totalBakeries: this.bakeries.length,
            categories: this.getCategories(),
            categoryCounts: this.getCategoryCounts(),
            citiesCount: new Set(this.bakeries.map(b => b.city).filter(c => c)).size,
            withPhone: this.bakeries.filter(b => b.phone).length,
            withWebsite: this.bakeries.filter(b => b.website).length,
            withEmail: this.bakeries.filter(b => b.email).length,
            halal: this.bakeries.filter(b => b.halal).length,
            organic: this.bakeries.filter(b => b.organic).length
        };
    }

    /**
     * Get count of bakeries per category
     */
    getCategoryCounts() {
        const counts = {};
        this.bakeries.forEach(bakery => {
            bakery.categories.forEach(category => {
                counts[category] = (counts[category] || 0) + 1;
            });
        });
        return counts;
    }
}

// Make it globally available
window.LibyaBakeryFetcher = LibyaBakeryFetcher;
