import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lindy API',
      version,
      description: 'API for Lindy data with MongoDB and Express',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://lindy-api.martinsson.io',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Styles',
        description: 'Style descriptions endpoints',
      },
      {
        name: 'Style Images',
        description: 'Style images endpoints',
      },
      {
        name: 'Products',
        description: 'Product endpoints',
      },
      {
        name: 'Favorites',
        description: 'Favorites endpoints',
      },
      {
        name: 'Customers',
        description: 'Customer endpoints',
      },
      {
        name: 'Transactions',
        description: 'Transaction endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics endpoints',
      },
      {
        name: 'Recommendations',
        description: 'Recommendation endpoints',
      },
      {
        name: 'Page Views',
        description: 'Page view endpoints',
      },
      {
        name: 'Product Reviews',
        description: 'Product review endpoints',
      },
      {
        name: 'Wardrobe',
        description: 'Wardrobe items endpoints',
      },
    ],
    paths: {
      '/api/styles': {
        get: {
          tags: ['Styles'],
          summary: 'Get all style descriptions',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StyleDescription' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/styles/search': {
        get: {
          tags: ['Styles'],
          summary: 'Search style descriptions by keyword',
          parameters: [
            {
              name: 'keyword',
              in: 'query',
              description: 'Keyword to search for',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StyleDescription' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/styles/{style}': {
        get: {
          tags: ['Styles'],
          summary: 'Get style description by style name',
          parameters: [
            {
              name: 'style',
              in: 'path',
              description: 'Style name',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/StyleDescription' }
                    }
                  }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/style-images': {
        get: {
          tags: ['Style Images'],
          summary: 'Get all style images',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StyleImage' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/style-images/all': {
        get: {
          tags: ['Style Images'],
          summary: 'Get all styles with images and descriptions',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            style: { type: 'string' },
                            description: { type: 'string' },
                            keywords: {
                              type: 'array',
                              items: { type: 'string' }
                            },
                            images: {
                              type: 'array',
                              items: { type: 'string' }
                            }
                          }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/style-images/{style}': {
        get: {
          tags: ['Style Images'],
          summary: 'Get style images by style name',
          parameters: [
            {
              name: 'style',
              in: 'path',
              description: 'Style name',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          styleImage: { $ref: '#/components/schemas/StyleImage' },
                          styleDescription: { $ref: '#/components/schemas/StyleDescription' }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products with pagination',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions/analytics/product-groups': {
        get: {
          tags: ['Analytics'],
          summary: 'Get product group sales analytics',
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date for analytics (ISO format)',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date for analytics (ISO format)',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      timeRange: {
                        type: 'object',
                        properties: {
                          startDate: { type: 'string', format: 'date-time' },
                          endDate: { type: 'string', format: 'date-time' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            count: { type: 'integer' },
                            productGroup: { type: 'string' },
                            uniqueCustomerCount: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/reviews/top-rated': {
        get: {
          tags: ['Product Reviews'],
          summary: 'Get top rated products',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of top products to return',
              schema: { type: 'integer', default: 10 }
            },
            {
              name: 'minReviews',
              in: 'query',
              description: 'Minimum number of reviews required',
              schema: { type: 'integer', default: 3 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            variantId: { type: 'string' },
                            averageScore: { type: 'number', format: 'float' },
                            reviewCount: { type: 'integer' },
                            productDetails: { $ref: '#/components/schemas/Product' }
                          }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/page-views/analytics': {
        get: {
          tags: ['Page Views'],
          summary: 'Get page view analytics',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          mostViewedProducts: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                variantId: { type: 'string' },
                                viewCount: { type: 'integer' },
                                productDetails: { $ref: '#/components/schemas/Product' }
                              }
                            }
                          },
                          viewsByDate: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                _id: { type: 'string' },
                                count: { type: 'integer' }
                              }
                            }
                          }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/recommendations/trending': {
        get: {
          tags: ['Recommendations'],
          summary: 'Get trending products',
          parameters: [
            {
              name: 'days',
              in: 'query',
              description: 'Number of days to consider for trending',
              schema: { type: 'integer', default: 30 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of trending products to return',
              schema: { type: 'integer', default: 10 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            variantId: { type: 'string' },
                            trendingScore: { type: 'integer' },
                            productDetails: { $ref: '#/components/schemas/Product' }
                          }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'Get all favorites with pagination',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Favorite' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/favorites/date': {
        get: {
          tags: ['Favorites'],
          summary: 'Get favorites by date range',
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date (ISO format)',
              required: true,
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date (ISO format)',
              required: true,
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Favorite' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/favorites/customer/{customerId}': {
        get: {
          tags: ['Favorites'],
          summary: 'Get favorites by customer ID',
          parameters: [
            {
              name: 'customerId',
              in: 'path',
              description: 'Customer ID',
              required: true,
              schema: { type: 'integer' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Favorite' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/favorites/product/{variantId}': {
        get: {
          tags: ['Favorites'],
          summary: 'Get favorites by product variant ID',
          parameters: [
            {
              name: 'variantId',
              in: 'path',
              description: 'Product variant ID',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Favorite' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/customers': {
        get: {
          tags: ['Customers'],
          summary: 'Get all customers',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/customers/search': {
        get: {
          tags: ['Customers'],
          summary: 'Search customers by name',
          parameters: [
            {
              name: 'name',
              in: 'query',
              description: 'Name to search for',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Get customer by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Customer ID',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Customer' }
                    }
                  }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'Get all transactions with pagination',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            },
            {
              name: 'sortField',
              in: 'query',
              description: 'Field to sort by',
              schema: { type: 'string', default: 'dayDate' }
            },
            {
              name: 'sortOrder',
              in: 'query',
              description: 'Sort order (asc or desc)',
              schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
            },
            {
              name: 'businessArea',
              in: 'query',
              description: 'Filter by business area',
              schema: { type: 'string' }
            },
            {
              name: 'productGroup',
              in: 'query',
              description: 'Filter by product group',
              schema: { type: 'string' }
            },
            {
              name: 'styleName',
              in: 'query',
              description: 'Filter by style name',
              schema: { type: 'string' }
            },
            {
              name: 'colorGroup',
              in: 'query',
              description: 'Filter by color group',
              schema: { type: 'string' }
            },
            {
              name: 'size',
              in: 'query',
              description: 'Filter by size',
              schema: { type: 'string' }
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Filter by start date (ISO format)',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Filter by end date (ISO format)',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      filters: { type: 'object' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions/date': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transactions by date range',
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date (ISO format)',
              required: true,
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date (ISO format)',
              required: true,
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions/customer/{customerId}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transactions by customer ID',
          parameters: [
            {
              name: 'customerId',
              in: 'path',
              description: 'Customer ID',
              required: true,
              schema: { type: 'integer' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions/product/{variantId}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transactions by product variant ID',
          parameters: [
            {
              name: 'variantId',
              in: 'path',
              description: 'Product variant ID',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/wardrobe': {
        get: {
          tags: ['Wardrobe'],
          summary: 'Get all wardrobe items with pagination',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/WardrobeItem' }
                      }
                    }
                  }
                }
              }
            },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/wardrobe/user/{userId}': {
        get: {
          tags: ['Wardrobe'],
          summary: 'Get wardrobe items by user ID',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              description: 'User ID',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/WardrobeItem' }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/wardrobe/type/{type}': {
        get: {
          tags: ['Wardrobe'],
          summary: 'Get wardrobe items by type',
          parameters: [
            {
              name: 'type',
              in: 'path',
              description: 'Item type (top, bottoms, dress, jacket, bag, accessory)',
              required: true,
              schema: { type: 'string', enum: ['top', 'bottoms', 'dress', 'jacket', 'bag', 'accessory'] }
            },
            {
              name: 'userId',
              in: 'query',
              description: 'Optional user ID to filter by',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/WardrobeItem' }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/wardrobe/tag/{tag}': {
        get: {
          tags: ['Wardrobe'],
          summary: 'Get wardrobe items by tag',
          parameters: [
            {
              name: 'tag',
              in: 'path',
              description: 'Tag to search for',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'userId',
              in: 'query',
              description: 'Optional user ID to filter by',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/WardrobeItem' }
                      }
                    }
                  }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/wardrobe/summary/{userId}': {
        get: {
          tags: ['Wardrobe'],
          summary: 'Get wardrobe summary by user ID',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              description: 'User ID',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalItems: { type: 'integer' },
                          typeBreakdown: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                type: { type: 'string' },
                                count: { type: 'integer' },
                                percentage: { type: 'integer' }
                              }
                            }
                          },
                          tags: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                tag: { type: 'string' },
                                count: { type: 'integer' }
                              }
                            }
                          }
                        }
                      },
                      fromCache: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/transactions/group/{productGroup}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transactions by product group',
          parameters: [
            {
              name: 'productGroup',
              in: 'path',
              description: 'Product group name',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page',
              schema: { type: 'integer', default: 50 }
            }
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      }
    },
    components: {
      schemas: {
        StyleDescription: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            style: { type: 'string' },
            styleDescription: { type: 'string' },
            styleKeywords: { 
              type: 'array',
              items: { type: 'string' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            variantId: { type: 'string' },
            productLink: { type: 'string' },
            productImageLink: { type: 'string' },
            modelImageLink: { type: 'string' },
            productDescSE: { type: 'string' },
            productDescEN: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Favorite: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            dayDate: { type: 'string', format: 'date-time' },
            maskedCustomerId: { type: 'integer' },
            variantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customerId: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            dayDate: { type: 'string', format: 'date-time' },
            maskedCustomerId: { type: 'integer' },
            variantId: { type: 'string' },
            businessAreaName: { type: 'string' },
            productGroupName: { type: 'string' },
            styleName: { type: 'string' },
            colourGroup: { type: 'string' },
            sizeDesc: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PageView: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            dayDate: { type: 'string', format: 'date-time' },
            maskedCustomerId: { type: 'integer' },
            variantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductReview: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            variantId: { type: 'string' },
            review: { type: 'string' },
            score: { type: 'integer', minimum: 1, maximum: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StyleImage: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            style: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WardrobeItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'integer' },
            imageUrl: { type: 'string' },
            type: { type: 'string', enum: ['top', 'bottoms', 'dress', 'jacket', 'bag', 'accessory'] },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        BadRequest: {
          description: 'The request contains invalid parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'An internal server error occurred',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
