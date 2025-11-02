# Libya Bakery Service Providers Data Collector
## مخابز وحلويات ليبيا

A comprehensive web-based tool for fetching, categorizing, and exporting bakery service provider data from Libya using OpenStreetMap data.

## Features

### Data Collection
- **Real-time Data Fetching**: Retrieves bakery data from OpenStreetMap's Overpass API
- **Comprehensive Coverage**: Searches for all bakery-related businesses in Libya including:
  - Traditional bakeries
  - Pastry shops
  - Confectioneries
  - Artisan bakeries

### Categories
The system automatically categorizes bakeries into:
- **Bakery**: Traditional bread bakeries
- **Pastry Shop**: Specialized pastry and dessert shops
- **Confectionery**: Sweet shops and candy stores
- **Artisan Bakery**: Craft bakeries
- **Bread Bakery**: Specialized bread shops
- **Cake Shop**: Cake and celebration bakeries
- **Organic Bakery**: Organic certified bakeries
- **Halal Certified**: Halal certified establishments

### Data Points Collected
For each bakery, the system collects:
- Name (Arabic and English)
- Categories
- Full address
- City/Location
- Phone number
- Website
- Email
- Opening hours
- GPS coordinates (latitude/longitude)
- Shop type
- Brand name
- Halal certification status
- Organic certification status
- OpenStreetMap reference link

### Statistics Dashboard
- Total number of bakeries found
- Number of categories
- Count of bakeries with phone numbers
- Count of bakeries with websites
- Number of halal certified bakeries
- Number of organic bakeries

### Export Options
- **JSON Format**: Complete data export with full metadata
- **CSV Format**: Spreadsheet-compatible format for analysis

### Filtering
- Filter bakeries by category
- View all or specific types of bakeries

## How to Use

1. **Open the Application**: Open `index.html` in a web browser
2. **Fetch Data**: Click the "🔍 Fetch Bakery Data from OpenStreetMap" button
3. **Wait for Results**: The system will query OpenStreetMap and display all found bakeries
4. **Browse Results**: View bakery cards with detailed information
5. **Filter Data**: Use the category filter to view specific types of bakeries
6. **Export Data**: Click "📥 Export as JSON" or "📊 Export as CSV" to download the data

## Technical Details

### Data Source
- **API**: OpenStreetMap Overpass API
- **Coverage**: All of Libya (Bounding box: 19.5°N to 33.2°N, 9.3°E to 25.2°E)
- **Query Types**: Nodes, ways, and relations with bakery-related tags

### Technologies Used
- Pure JavaScript (ES6+)
- HTML5
- CSS3 with responsive design
- Fetch API for data retrieval
- Blob API for data export

### Architecture
- `LibyaBakeryFetcher` class: Core data fetching and processing engine
- Overpass QL: Query language for OpenStreetMap data
- Responsive grid layout for data display
- Real-time filtering and categorization

## Data Structure

### Bakery Object
```json
{
  "id": 123456789,
  "type": "node",
  "name": "Bakery Name",
  "nameArabic": "اسم المخبز",
  "nameEnglish": "Bakery Name",
  "categories": ["Bakery", "Halal Certified"],
  "address": "Street Name, District, City",
  "city": "Tripoli",
  "phone": "+218-XX-XXXXXXX",
  "website": "https://example.com",
  "email": "contact@example.com",
  "openingHours": "Mo-Su 08:00-20:00",
  "latitude": 32.8872,
  "longitude": 13.1913,
  "shopType": "bakery",
  "brand": "Brand Name",
  "halal": true,
  "organic": false,
  "osmUrl": "https://www.openstreetmap.org/node/123456789"
}
```

## Limitations

- Data quality depends on OpenStreetMap contributors
- Some bakeries may not be listed in OpenStreetMap
- Contact information may be outdated
- API requests may have timeout limits (60 seconds)

## Future Enhancements

- Add map visualization of bakery locations
- Implement distance-based search
- Add user reviews and ratings
- Support for multiple languages
- Real-time data validation
- Integration with other data sources

## Contributing to OpenStreetMap

If you find missing or incorrect bakery data, you can contribute to OpenStreetMap:
1. Visit [OpenStreetMap.org](https://www.openstreetmap.org)
2. Create an account
3. Add or edit bakery information
4. Your contributions will appear in this tool after the next data fetch

## License

This project uses data from OpenStreetMap, which is available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

## Support

For issues or questions, please refer to:
- OpenStreetMap Documentation: https://wiki.openstreetmap.org
- Overpass API Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API

---

Built with ❤️ for the Libyan bakery community
