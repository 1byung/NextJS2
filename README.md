# Wind Turbine Monitoring Dashboard

A professional industrial dashboard for monitoring wind turbine performance with real-time analytics and anomaly detection.

## Features

### Left Sidebar - Unit List
- **6 Wind Turbines** with real-time yield monitoring
- **Status Indicators:**
  - 🟢 Green (96-100%): Normal operation
  - 🟡 Yellow (88-95%): Warning state
  - 🔴 Red (<88%): Critical fault - **Unit 6 shows critical state at 80% yield**
- **Interactive Selection:** Click any unit to view detailed analytics
- Visual status bars and color-coded indicators

### Right Main View - Detailed Analysis

#### Top Chart: Power Curve Analysis (Yellow Section)
- **S-Curve Power Curve Visualization (Wind Speed vs Power)**
- Orange S-shaped curve represents the theoretical power curve
- Blue scatter dots show actual performance data points
- **Performance Analysis:**
  - Normal units: Dots cluster tightly on or near the S-curve
  - Warning units: Dots slightly below the curve (85-95% performance)
  - Critical units: Dots significantly scattered below the curve (50-80% performance)
  - X-Axis: Wind Speed (m/s, 0-25 range)
  - Y-Axis: Power Output (kW, up to 2000 kW rated power)

#### Bottom Charts: Correlation Factors (Green Section)
- **4 Key Performance Indicators (Time-Series):**
  - Rotor Speed (RPM) - 0-25 RPM range
  - Pitch Angle (degrees) - 0-20° range
  - Generator Temperature (°C) - 60-95°C range
  - Wind Speed (m/s) - 0-15 m/s range
- **Operational Context:**
  - Shows time-series data for operational variables
  - Green trend lines for visual consistency
  - Corresponds to the data points in the Power Curve above
  - Helps identify operational issues affecting performance
  - Small multiple charts for easy comparison

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts (Composed Charts, Line Charts, Area Charts)
- **Icons:** Lucide React
- **UI Theme:** Industrial Dark Mode

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── Sidebar.tsx                 # Unit list sidebar
│   ├── PowerCurveChart.tsx         # Top Power Curve chart (S-Curve)
│   └── CorrelationFactorsChart.tsx # Bottom time-series factor charts
├── lib/
│   └── mockData.ts         # Data generation utilities
└── README.md
```

## Data Scenarios

### Power Curve Model
The dashboard uses a realistic wind turbine power curve based on:
- **Cut-in speed:** 3 m/s (turbine starts producing power)
- **Rated speed:** 12 m/s (turbine reaches maximum power)
- **Cut-out speed:** 25 m/s (turbine shuts down for safety)
- **Rated power:** 2000 kW
- **Curve formula:** Power ≈ k × (WindSpeed)³ (in the linear region)

### Unit Performance Levels

#### Normal Units (Units 1, 2, 3, 5)
- Yield: 95-100%
- Power curve performance: 95-105% of theoretical curve
- Scatter dots cluster tightly on the S-curve
- All operational parameters within optimal ranges

#### Warning Unit (Unit 4)
- Yield: 91.3%
- Power curve performance: 85-95% of theoretical curve
- Scatter dots slightly below the S-curve
- Moderate operational parameter variations

#### Critical Unit (Unit 6)
- **Fixed at 80% yield** (below threshold)
- Power curve performance: 50-80% of theoretical curve
- Scatter dots significantly below and away from the S-curve
- Red border and alert indicators
- Degraded operational parameters (low rotor speed, high pitch angle, high temperature)

## Key Features Implemented

✅ Professional industrial dark mode UI
✅ Real-time unit selection and switching
✅ **S-Curve Power Curve visualization** (Wind Speed vs Power)
✅ ScatterChart + ComposedChart from Recharts
✅ Theoretical power curve baseline (smooth S-curve)
✅ Performance deviation visualization (dots vs curve)
✅ Time-series correlation factor charts
✅ Responsive design
✅ TypeScript type safety
✅ Modular component architecture
✅ Realistic power curve data generation (cubic relationship)
✅ Status-based visual indicators
✅ Interactive tooltips and legends

## Customization

### Changing Data Parameters
Edit `lib/mockData.ts` to adjust:
- Power curve parameters (cut-in speed, rated speed, rated power)
- Performance degradation factors
- Number of data points
- Correlation factor ranges
- Unit yield thresholds

### Styling
Modify `app/globals.css` and Tailwind classes in components for:
- Color schemes
- Layout adjustments
- Font customization

### Chart Configuration
Update Recharts props in chart components for:
- Domain ranges
- Grid styles
- Tooltip formats
- Legend positioning

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Created with Next.js, TypeScript, and Recharts for industrial monitoring applications.
