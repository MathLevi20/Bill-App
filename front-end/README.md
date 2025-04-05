# Lumi Bill Analyzer

![Lumi Logo](src/assets/logo.png)

A web application for analyzing electricity bills and visualizing energy consumption data.

## Assets

- The `src/assets` folder contains static files like the logo (`logo.png`).
- Replace the placeholder logo with your actual logo.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Install dependencies:

```bash
yarn
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Modify the values as needed

3. Start the development server:

```bash
yarn start
```

4. Build for production:

```bash
yarn build
```

### Testing

Run the test suite:

```bash
yarn test
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for routing
- `/src/services` - API service functions
- `/src/types` - TypeScript type definitions

## Environment Variables

The application uses the following environment variables:

- `REACT_APP_API_URL`: URL for the backend API
- `REACT_APP_ENV`: Current environment (development, production)
- `REACT_APP_ENABLE_MOCK_DATA`: Flag to enable mock data for development
