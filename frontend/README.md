# Algorithm Visualizer - Frontend

The frontend for the Algorithm Visualizer project. It provides an interactive 3D interface for visualizing algorithmic processes using React and Three.js.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **3D Visualization**: `react-force-graph-3d` & `three.js`
- **Charting**: Recharts

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the app for production:
```bash
npm run build
```

This will run TypeScript type-checking and then build the app into the `dist` folder.
