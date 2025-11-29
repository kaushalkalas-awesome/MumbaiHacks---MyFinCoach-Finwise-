# API Examples - AA FIU Sandbox

This document provides detailed curl examples for all API endpoints.

## Authentication Headers

All API endpoints (except `/health` and Mock AA UI) require these headers:

```bash
-H "x-client-id: mock_fiu_client_123"
-H "x-client-secret: mock_secret_key_456"
```

---

## 1. Health Check

**No authentication required**

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "service": "AA FIU Sandbox",
  "version": "1.0.0"
}
```

---

## 2. List FIPs

```bash
curl -X GET http://localhost:3000/v2/fips \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456"
```

**Response:**
```json
{
  "data": [
    {
      "id": "HDFC_BANK",
      "name": "HDFC Bank",
      "institutionType": "BANK",
      "status": "ACTIVE",
      "fiTypes": ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"]
    },
    {
      "id": "ICICI_BANK",
      "name": "ICICI Bank",
      "institutionType": "BANK",
      "status": "ACTIVE",
      "fiTypes": ["DEPOSIT", "TERM_DEPOSIT"]
    }
  ]
}
```

---

## 3. Create Consent Request

```bash
curl -X POST http://localhost:3000/consents \
  -H "Content-Type: application/json" \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456" \
  -d '{
    "Detail": {
      "Customer": {
        "id": "CUST001"
      },
      "Purpose": {
        "code": "WEALTH_MANAGEMENT",
        "text": "Wealth Management Services"
      },
      "FIDataRange": {
        "from": "2023-01-01T00:00:00Z",
        "to": "2024-12-31T23:59:59Z"
      },
      "DataLife": {
        "unit": "MONTH",
        "value": 6
      },
      "Frequency": {
        "unit": "MONTHLY",
        "value": 1
      },
      "DataFilter": [
        { "type": "DEPOSIT" },
        { "type": "MUTUAL_FUNDS" }
      ]
    },
    "redirectUrl": "https://your-fiu-app.com/callback",
    "consentMode": "VIEW",
    "fetchType": "ONETIME"
  }'
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "url": "http://localhost:3000/mock-aa/consents/550e8400-e29b-41d4-a716-446655440000",
  "redirectUrl": "https://your-fiu-app.com/callback",
  "Detail": {
    "consentStart": "2024-11-29T02:15:00.000Z",
    "consentExpiry": "2025-11-29T02:15:00.000Z",
    "Customer": {
      "id": "CUST001"
    },
    "FIDataRange": {
      "from": "2023-01-01T00:00:00.000Z",
      "to": "2024-12-31T23:59:59.000Z"
    },
    "consentMode": "VIEW",
    "fetchType": "ONETIME",
    "Frequency": {
      "unit": "MONTHLY",
      "value": 1
    },
    "DataLife": {
      "unit": "MONTH",
      "value": 6
    },
    "DataFilter": [
      { "type": "DEPOSIT" },
      { "type": "MUTUAL_FUNDS" }
    ],
    "Purpose": {
      "code": "WEALTH_MANAGEMENT",
      "text": "WEALTH_MANAGEMENT"
    }
  }
}
```

---

## 4. Get Consent Status

```bash
curl -X GET http://localhost:3000/consents/550e8400-e29b-41d4-a716-446655440000 \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456"
```

**Response (PENDING):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "url": "http://localhost:3000/mock-aa/consents/550e8400-e29b-41d4-a716-446655440000",
  "redirectUrl": "https://your-fiu-app.com/callback",
  "Detail": { ... }
}
```

**Response (ACTIVE - after approval):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "redirectUrl": "https://your-fiu-app.com/callback",
  "Detail": {
    "consentStart": "2024-11-29T02:15:00.000Z",
    "consentExpiry": "2025-11-29T02:15:00.000Z",
    "Customer": {
      "id": "CUST001"
    },
    "FIDataRange": {
      "from": "2023-01-01T00:00:00.000Z",
      "to": "2024-12-31T23:59:59.000Z"
    },
    "Accounts": [
      {
        "linkRefNumber": "abc123-def456-ghi789",
        "maskedAccNumber": "XXXX1234",
        "fiType": "DEPOSIT",
        "fipId": "HDFC_BANK"
      },
      {
        "linkRefNumber": "xyz789-uvw456-rst123",
        "maskedAccNumber": "XXXX9012",
        "fiType": "MUTUAL_FUNDS",
        "fipId": "HDFC_MF"
      }
    ]
  }
}
```

---

## 5. Create Data Fetch Session

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456" \
  -d '{
    "consentId": "550e8400-e29b-41d4-a716-446655440000",
    "DataRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    },
    "format": "json"
  }'
```

**Response (201 Created):**
```json
{
  "id": "abc12345-6789-def0-1234-56789abcdef0",
  "consentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "DataRange": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-12-31T23:59:59.000Z"
  },
  "format": "json",
  "Payload": []
}
```

---

## 6. Get FI Data (Fetch Session)

```bash
curl -X GET http://localhost:3000/sessions/abc12345-6789-def0-1234-56789abcdef0 \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456"
```

**Response (200 OK - COMPLETED):**
```json
{
  "id": "abc12345-6789-def0-1234-56789abcdef0",
  "consentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "DataRange": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-12-31T23:59:59.000Z"
  },
  "format": "json",
  "Payload": [
    {
      "fipID": "HDFC_BANK",
      "data": [
        {
          "linkRefNumber": "abc123-def456-ghi789",
          "maskedAccNumber": "XXXX1234",
          "decryptedFI": {
            "fiType": "DEPOSIT",
            "data": [
              {
                "merchant": "Amazon",
                "description": "Payment to Amazon",
                "mode": "UPI",
                "reference": "TXNABC123XYZ",
                "balance": 45000,
                "transactionDate": "2024-11-15T10:30:00.000Z",
                "amount": 1500,
                "type": "DEBIT"
              },
              {
                "merchant": "Salary/Transfer",
                "description": "Credit transaction",
                "mode": "NEFT",
                "reference": "TXNDEF456UVW",
                "balance": 95000,
                "transactionDate": "2024-11-01T09:00:00.000Z",
                "amount": 50000,
                "type": "CREDIT"
              }
            ]
          }
        }
      ]
    },
    {
      "fipID": "HDFC_MF",
      "data": [
        {
          "linkRefNumber": "xyz789-uvw456-rst123",
          "maskedAccNumber": "XXXX9012",
          "decryptedFI": {
            "fiType": "MUTUAL_FUNDS",
            "data": [
              {
                "schemeName": "HDFC Equity Fund",
                "units": 120,
                "nav": "65.50",
                "currentValue": "7860.00",
                "folioNumber": "FOLABC123XYZ",
                "transactionDate": "2024-11-01T00:00:00.000Z",
                "amount": 7860,
                "type": "CREDIT"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Error Responses

### Missing Authentication Headers

```bash
curl -X GET http://localhost:3000/v2/fips
```

**Response (401 Unauthorized):**
```json
{
  "errorCode": "MISSING_CREDENTIALS",
  "errorMsg": "Missing x-client-id or x-client-secret headers",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "txnid": "N/A",
  "ver": "1.0"
}
```

### Invalid Credentials

```bash
curl -X GET http://localhost:3000/v2/fips \
  -H "x-client-id: wrong_id" \
  -H "x-client-secret: wrong_secret"
```

**Response (401 Unauthorized):**
```json
{
  "errorCode": "INVALID_CREDENTIALS",
  "errorMsg": "Invalid client credentials",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "txnid": "N/A",
  "ver": "1.0"
}
```

### Consent Not Found

```bash
curl -X GET http://localhost:3000/consents/invalid-consent-id \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456"
```

**Response (404 Not Found):**
```json
{
  "errorCode": "CONSENT_NOT_FOUND",
  "errorMsg": "Consent not found",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "txnid": "N/A",
  "ver": "1.0"
}
```

### Invalid Date Range

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456" \
  -d '{
    "consentId": "550e8400-e29b-41d4-a716-446655440000",
    "DataRange": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    }
  }'
```

**Response (400 Bad Request):**
```json
{
  "errorCode": "INVALID_DATE_RANGE",
  "errorMsg": "From date must be before to date",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "txnid": "N/A",
  "ver": "1.0"
}
```

### Consent Not Active

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -H "x-client-id: mock_fiu_client_123" \
  -H "x-client-secret: mock_secret_key_456" \
  -d '{
    "consentId": "pending-consent-id",
    "DataRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    }
  }'
```

**Response (400 Bad Request):**
```json
{
  "errorCode": "INVALID_CONSENT_STATUS",
  "errorMsg": "Consent status must be one of: ACTIVE. Current status: PENDING",
  "timestamp": "2024-11-29T02:15:00.000Z",
  "txnid": "N/A",
  "ver": "1.0"
}
```

---

## Testing with Postman

Import these curl commands into Postman:
1. Click "Import" → "Raw text"
2. Paste any curl command
3. Click "Continue" → "Import"

Or create a collection with:
- Base URL: `http://localhost:3000`
- Authorization: None (use headers)
- Headers:
  - `x-client-id`: `mock_fiu_client_123`
  - `x-client-secret`: `mock_secret_key_456`
