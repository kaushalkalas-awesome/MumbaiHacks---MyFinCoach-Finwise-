const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mock AA + FIU Sandbox API',
            version: '1.0.0',
            description: 'A comprehensive simulation of Account Aggregator APIs with real state transitions and mock data',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                ClientAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-client-id',
                    description: 'Client ID for authentication'
                },
                ClientSecret: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-client-secret',
                    description: 'Client Secret for authentication'
                }
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        errorCode: {
                            type: 'string',
                            example: 'INVALID_REQUEST'
                        },
                        errorMsg: {
                            type: 'string',
                            example: 'Missing required fields'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-11-29T05:56:00.000Z'
                        },
                        txnid: {
                            type: 'string',
                            example: 'TXN123456'
                        },
                        ver: {
                            type: 'string',
                            example: '1.0'
                        }
                    }
                },
                FIPResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: 'string',
                                        example: 'HDFC_BANK'
                                    },
                                    name: {
                                        type: 'string',
                                        example: 'HDFC Bank'
                                    },
                                    institutionType: {
                                        type: 'string',
                                        enum: ['BANK', 'NBFC', 'MUTUAL_FUND', 'INSURANCE', 'PENSION_FUND', 'OTHER'],
                                        example: 'BANK'
                                    },
                                    status: {
                                        type: 'string',
                                        enum: ['ACTIVE', 'INACTIVE'],
                                        example: 'ACTIVE'
                                    },
                                    fiTypes: {
                                        type: 'array',
                                        items: {
                                            type: 'string'
                                        },
                                        example: ['DEPOSIT', 'TERM_DEPOSIT']
                                    }
                                }
                            }
                        }
                    }
                },
                ConsentRequest: {
                    type: 'object',
                    required: ['Detail', 'redirectUrl'],
                    properties: {
                        Detail: {
                            type: 'object',
                            required: ['Customer', 'Purpose', 'FIDataRange', 'DataLife', 'Frequency', 'DataFilter'],
                            properties: {
                                Customer: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string',
                                            example: 'CUST001'
                                        }
                                    }
                                },
                                Purpose: {
                                    type: 'object',
                                    properties: {
                                        code: {
                                            type: 'string',
                                            example: 'WEALTH_MANAGEMENT'
                                        },
                                        text: {
                                            type: 'string',
                                            example: 'Wealth Management Services'
                                        }
                                    }
                                },
                                FIDataRange: {
                                    type: 'object',
                                    properties: {
                                        from: {
                                            type: 'string',
                                            format: 'date-time',
                                            example: '2023-01-01T00:00:00Z'
                                        },
                                        to: {
                                            type: 'string',
                                            format: 'date-time',
                                            example: '2024-12-31T23:59:59Z'
                                        }
                                    }
                                },
                                DataLife: {
                                    type: 'object',
                                    properties: {
                                        unit: {
                                            type: 'string',
                                            enum: ['MONTH', 'YEAR', 'DAY', 'INF'],
                                            example: 'MONTH'
                                        },
                                        value: {
                                            type: 'number',
                                            example: 6
                                        }
                                    }
                                },
                                Frequency: {
                                    type: 'object',
                                    properties: {
                                        unit: {
                                            type: 'string',
                                            enum: ['HOURLY', 'DAILY', 'MONTHLY', 'YEARLY'],
                                            example: 'MONTHLY'
                                        },
                                        value: {
                                            type: 'number',
                                            example: 1
                                        }
                                    }
                                },
                                DataFilter: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            type: {
                                                type: 'string',
                                                example: 'DEPOSIT'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        redirectUrl: {
                            type: 'string',
                            example: 'https://your-fiu-app.com/callback'
                        },
                        consentMode: {
                            type: 'string',
                            enum: ['STORE', 'VIEW', 'QUERY', 'STREAM'],
                            example: 'VIEW'
                        },
                        fetchType: {
                            type: 'string',
                            enum: ['ONETIME', 'PERIODIC'],
                            example: 'ONETIME'
                        }
                    }
                },
                ConsentResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED', 'FAILED'],
                            example: 'PENDING'
                        },
                        url: {
                            type: 'string',
                            example: 'http://localhost:3000/mock-aa/consents/550e8400-e29b-41d4-a716-446655440000'
                        },
                        redirectUrl: {
                            type: 'string',
                            example: 'https://your-fiu-app.com/callback'
                        },
                        Detail: {
                            type: 'object'
                        }
                    }
                },
                SessionRequest: {
                    type: 'object',
                    required: ['consentId', 'DataRange'],
                    properties: {
                        consentId: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        DataRange: {
                            type: 'object',
                            properties: {
                                from: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-01T00:00:00Z'
                                },
                                to: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-12-31T23:59:59Z'
                                }
                            }
                        },
                        format: {
                            type: 'string',
                            enum: ['json', 'xml'],
                            example: 'json'
                        }
                    }
                },
                SessionResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: 'abc12345-6789-def0-1234-56789abcdef0'
                        },
                        consentId: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'COMPLETED', 'FAILED', 'PARTIAL'],
                            example: 'PENDING'
                        },
                        DataRange: {
                            type: 'object',
                            properties: {
                                from: {
                                    type: 'string',
                                    format: 'date-time'
                                },
                                to: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        },
                        format: {
                            type: 'string',
                            example: 'json'
                        },
                        Payload: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                ClientAuth: [],
                ClientSecret: []
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
