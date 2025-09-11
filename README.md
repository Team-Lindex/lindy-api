# Lindy API

An Express API using TypeScript and MongoDB with Mongoose for accessing Lindy data.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy the example environment file to create your own:

```bash
cp .env.example .env
```

Edit the `.env` file to match your environment settings. The following variables are available:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/?authMechanism=DEFAULT

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# JWT Configuration (if authentication is implemented)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=1d

# Logging Configuration
LOG_LEVEL=debug
```

### Environment-Specific Configuration

The API supports different configurations for development, testing, and production environments. You can create environment-specific files:

- `.env.development` - Development environment settings
- `.env.test` - Testing environment settings
- `.env.production` - Production environment settings

To use a specific environment configuration, set the `NODE_ENV` variable:

```bash
NODE_ENV=production npm start
```

## Importing Data

The API comes with a utility to import CSV data from the `datafiles` folder into MongoDB:

```bash
npm run import-data
```

This will import all the CSV files into their respective MongoDB collections.

## Running the API

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

## API Endpoints

### Style Descriptions

- `GET /api/styles` - Get all style descriptions
- `GET /api/styles/search?keyword=value` - Search style descriptions by keyword
- `GET /api/styles/id/:id` - Get style description by ID
- `GET /api/styles/:style` - Get style description by style name

### Style Images

- `GET /api/style-images` - Get all style images
- `GET /api/style-images/:style` - Get style images by style name
- `GET /api/style-images/all` - Get all styles with images and descriptions

### Products

- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/search?query=value` - Search products by description
- `GET /api/products/:variantId` - Get product by variant ID

### Favorites

- `GET /api/favorites` - Get all favorites (with pagination)
- `GET /api/favorites/date?startDate=value&endDate=value` - Get favorites by date range
- `GET /api/favorites/customer/:customerId` - Get favorites by customer ID
- `GET /api/favorites/product/:variantId` - Get favorites by variant ID

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/search?name=value` - Search customers by name
- `GET /api/customers/:id` - Get customer by ID

### Transactions

- `GET /api/transactions` - Get all transactions (with pagination)
- `GET /api/transactions/date?startDate=value&endDate=value` - Get transactions by date range
- `GET /api/transactions/customer/:customerId` - Get transactions by customer ID
- `GET /api/transactions/product/:variantId` - Get transactions by variant ID
- `GET /api/transactions/group/:productGroup` - Get transactions by product group

### Page Views

- `GET /api/page-views` - Get all page views (with pagination)
- `GET /api/page-views/customer/:customerId` - Get page views by customer ID
- `GET /api/page-views/product/:variantId` - Get page views by product ID
- `GET /api/page-views/analytics` - Get page view analytics (most viewed products, views by date)

### Product Reviews

- `GET /api/reviews` - Get all product reviews (with pagination)
- `GET /api/reviews/product/:variantId` - Get reviews for a specific product
- `GET /api/reviews/top-rated` - Get top rated products based on reviews

### Analytics

- `GET /api/transactions/analytics/product-groups` - Get product group sales analytics
- `GET /api/transactions/analytics/customer-purchases` - Get customer purchase analytics
- `GET /api/transactions/analytics/sales-trends?period=month` - Get sales trends by time period (day, week, month, year)

### Recommendations

- `GET /api/recommendations/customer/:customerId` - Get personalized recommendations for a customer
- `GET /api/recommendations/trending?days=30` - Get trending products
- `GET /api/recommendations/similar/:variantId` - Get similar products

## Project Structure

```
lindy-api/
├── datafiles/           # CSV data files
├── logs/                # Application logs
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── .env.production      # Production environment variables
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## API Documentation

API documentation is available at `/api-docs` when the server is running. This provides a Swagger UI interface to explore and test the API endpoints.

## Features

- **TypeScript**: Strongly typed code for better developer experience
- **MongoDB with Mongoose**: Robust database integration
- **Environment-specific Configuration**: Different settings for development, testing, and production
- **API Documentation**: Swagger UI for exploring and testing endpoints
- **Data Import Utility**: Import CSV data into MongoDB
- **Caching**: In-memory caching for improved performance
- **Rate Limiting**: Protect API endpoints from abuse
- **Logging**: Comprehensive logging for monitoring and debugging
- **Error Handling**: Consistent error responses
- **Request Validation**: Validate incoming requests
- **Analytics Endpoints**: Get insights from transaction data
- **Recommendation Engine**: Personalized product recommendations
