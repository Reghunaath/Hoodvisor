# Hoodvisor - Your Neighborhood Safety Guide 🏘️

Hoodvisor is a Chrome extension that provides safety scores for neighborhoods and streets when browsing properties on Zillow. It helps home seekers make informed decisions by displaying safety metrics for both the neighborhood (ZIP code level) and specific street locations.

## Features 🌟

- Real-time safety score calculation for any property listing on Zillow
- Two-level safety analysis:
  - Neighborhood Safety Score (ZIP code based)
  - Street-specific Safety Score
- Interactive semi-circular gauges with color-coded safety levels
- Clean, modern dark-themed UI
- Instant address parsing and validation

## Installation 🔧

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage 📱

1. Visit any property listing on Zillow (homedetails or apartments)
2. Click the Hoodvisor extension icon in your browser
3. View the comprehensive safety analysis including:
   - Property location details
   - Neighborhood safety score
   - Street-specific safety score
   - Visual gauge representations

## Technical Details 🛠️

### Built With
- JavaScript
- D3.js for gauge visualization
- Papa Parse for CSV parsing
- Chrome Extension APIs (Manifest V2)

### Data Sources
- ZIP code safety data (`zipcode_data.json`)
- Street-level safety data (`Street_Data.csv`)

### Features
- Address parsing and normalization
- Safety score calculation and visualization
- Responsive gauge design
- Error handling and validation

## Safety Score Scale 📊

The safety scores are represented on a scale of 0-100:
- 0-20: Very Poor
- 21-40: Poor
- 41-60: Fair
- 61-80: Good
- 81-100: Excellent

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Acknowledgments 🙏

- Zillow for property data access
- D3.js community for visualization tools
- Papa Parse for CSV parsing capabilities

## Screenshots 📸
![image](https://github.com/user-attachments/assets/45ef131c-6ce9-442c-b839-93f9aa6d7226)
