# Swagger API Documentation

The Mock AA + FIU Sandbox now includes comprehensive Swagger/OpenAPI 3.0 documentation!

## 🎯 Access Swagger UI

Once the server is running, access the interactive API documentation at:

**http://localhost:3000/api-docs**

## ✨ Features

### Interactive API Testing
- **Try it out**: Test all endpoints directly from the browser
- **Authentication**: Easy setup with x-client-id and x-client-secret headers
- **Request/Response Examples**: See real examples for all endpoints
- **Schema Validation**: View detailed request/response schemas

### Documented Endpoints

#### FIPs
- `GET /v2/fips` - List all Financial Information Providers

#### Consents
- `POST /consents` - Create new consent request
- `GET /consents/{requestId}` - Get consent details

#### Sessions
- `POST /sessions` - Create data fetch session
- `GET /sessions/{requestId}` - Get FI data

### Security Configuration

All endpoints (except health check) require authentication headers:

```
x-client-id: mock_fiu_client_123
x-client-secret: mock_secret_key_456
```

In Swagger UI:
1. Click the "Authorize" button (🔓)
2. Enter the client ID and secret
3. Click "Authorize"
4. All subsequent requests will include these headers

## 📋 OpenAPI Specification

The OpenAPI 3.0 specification is available at:

**http://localhost:3000/api-docs.json**

You can import this into:
- Postman
- Insomnia
- API testing tools
- Code generators

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Open Swagger UI**:
   ```
   http://localhost:3000/api-docs
   ```

3. **Authorize**:
   - Click "Authorize" button
   - Enter credentials from `.env` file
   - Click "Authorize"

4. **Test an endpoint**:
   - Expand `GET /v2/fips`
   - Click "Try it out"
   - Click "Execute"
   - View the response

## 📚 Schema Documentation

All request/response schemas are fully documented with:
- Field types and formats
- Required fields
- Enum values
- Example data
- Descriptions

### Key Schemas

- **FIPResponse**: List of Financial Information Providers
- **ConsentRequest**: Create consent request body
- **ConsentResponse**: Consent details and status
- **SessionRequest**: Data fetch request body
- **SessionResponse**: FI data payload
- **ErrorResponse**: Standard error format

## 🎨 Customization

The Swagger UI is customized with:
- Hidden topbar for cleaner interface
- Custom site title
- Organized by tags (FIPs, Consents, Sessions)

## 💡 Tips

1. **Use Examples**: Each endpoint has example requests you can modify
2. **Check Schemas**: Click on schema names to see detailed structure
3. **Download Spec**: Use `/api-docs.json` to get the OpenAPI spec
4. **Test Flows**: Follow the complete flow from consent creation to data fetch

## 🔗 Related Documentation

- [README.md](../README.md) - Main documentation
- [API_EXAMPLES.md](../API_EXAMPLES.md) - Curl examples
- [walkthrough.md](./.gemini/antigravity/brain/.../walkthrough.md) - Implementation details

---

**Happy Testing! 🎉**
