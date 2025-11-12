# QHealth Web Application: GALE API Integration Guide

This guide provides a complete, step-by-step documentation on how the QHealth web application sends measurement data to the GALE External API endpoint. The integration handles data transformation, validation, and secure transmission of vital signs and health metrics.

## Overview

The QHealth application integrates with the GALE External API to send health scan results after completing a measurement session. The integration is implemented in `src/services/galeExternalAPI.ts` and handles:

- Configuration management via environment variables
- Data transformation from internal format to GALE API format
- Request validation and error handling
- Secure API communication with authentication

## Prerequisites

Before integrating or modifying the GALE API integration, ensure you have:

- **Node.js** (version 20 or higher): Required for the web application runtime
- **Environment Variables**: Configured with GALE API credentials
- **GALE API Access**: Valid API token and base URL from GALE
- **Understanding of TypeScript/React**: The codebase uses TypeScript and React

## Step 1: Environment Configuration

The GALE API integration reads configuration from environment variables. Set up the following variables:

### Required Environment Variables

```bash
GALE_API_BASE_URL=https://dev-external-api-gale.mangobeach-5e679f1c.southeastasia.azurecontainerapps.io
GALE_API_KEY=your_api_token_here
GALE_SCAN_SOURCE_SYSTEM_NAME=QHealth System
GALE_SCAN_SOURCE_PUBLISHER=QHealth
GALE_API_ENABLED=true
```

### Configuration Details

- **GALE_API_BASE_URL**: The base URL of the GALE External API (without trailing slash)
- **GALE_API_KEY**: Authentication token for API access
- **GALE_SCAN_SOURCE_SYSTEM_NAME**: System identifier (defaults to "QHealth System")
- **GALE_SCAN_SOURCE_PUBLISHER**: Publisher identifier (defaults to "QHealth")
- **GALE_API_ENABLED**: Enable/disable API integration (defaults to `true` if not set)

### Configuration Loading

The `getGaleAPIConfig()` function loads configuration from environment variables:

```typescript
function getGaleAPIConfig(): GaleAPIConfig | null {
  const baseURL = process.env.GALE_API_BASE_URL
  const apiToken = process.env.GALE_API_KEY
  const systemName = process.env.GALE_SCAN_SOURCE_SYSTEM_NAME || "QHealth System"
  const publisher = process.env.GALE_SCAN_SOURCE_PUBLISHER || "QHealth"
  const enabled = process.env.GALE_API_ENABLED !== "false"
  
  // Returns configuration object or null if missing required values
}
```

**Note**: The implementation includes a fallback configuration for development/testing purposes. Remove this in production.

## Step 2: Data Flow Overview

The data flow from measurement completion to GALE API follows these steps:

1. **Measurement Completion**: User completes a health scan in the QHealth application
2. **Data Collection**: Vital signs and health metrics are collected in `MeasurementResults` format
3. **Data Transformation**: Internal `VitalSigns` format is transformed to GALE API format
4. **Validation**: Payload is validated for required fields and data presence
5. **API Request**: POST request is sent to GALE API endpoint
6. **Response Handling**: Success or error response is processed

## Step 3: Data Transformation

The `transformVitalSignsToGaleFormat()` function converts internal `VitalSigns` structure to the flat JSON format required by GALE API.

### Internal Data Structure

The application uses a structured format where each vital sign has:
- `value`: The actual measurement value (can be number, string, object, or null)
- `isEnabled`: Boolean indicating if the vital sign is enabled/available
- `confidenceLevel`: Optional confidence metric for certain vital signs

### Transformation Process

1. **Initialize Result Object**: Creates a `scanResult` object with all GALE API fields initialized to `null`
2. **Extract Values**: Uses helper functions to extract values from `VitalSign` objects
3. **Type Conversion**: Converts values to appropriate types (numbers, percentage strings)
4. **Handle Special Cases**: Processes complex types like blood pressure (systolic/diastolic split)

### Helper Functions

- **`getValue()`**: Extracts value from `VitalSign`, returns `null` if not enabled or missing
- **`getNumericValue()`**: Converts value to number, handles string-to-number conversion
- **`getRiskValue()`**: Formats risk values as percentage strings (e.g., `1` → `"1%"`)

### Field Mapping

The transformation maps internal field names to GALE API field names:

| Internal Field | GALE API Field | Type |
|---------------|----------------|------|
| `pulseRate` | `pulse_rate` | number |
| `respirationRate` | `respiration_rate` | number |
| `spo2` | `spo2` | number |
| `bloodPressure` | `blood_pressure_systolic`, `blood_pressure_diastolic` | number, number |
| `sdnn` | `sdnn` | number |
| `rmssd` | `rmssd` | number |
| `sd1` | `sd1` | number |
| `sd2` | `sd2` | number |
| `meanRri` | `mean_rri` | number |
| `rri` | `rri` | array |
| `lfhf` | `lf_hf_ratio` | number |
| `stressLevel` | `stress_level` | number |
| `stressIndex` | `stress_index` | number |
| `normalizedStressIndex` | `normalized_stress_index` | number |
| `wellnessIndex` | `wellness_index` | number |
| `wellnessLevel` | `wellness_level` | number |
| `snsIndex` | `sns_index` | number |
| `snsZone` | `sns_zone` | string/number |
| `pnsIndex` | `pns_index` | number |
| `pnsZone` | `pns_zone` | string/number |
| `prq` | `prq` | number |
| `heartAge` | `heart_age` | number |
| `hemoglobin` | `hemoglobin` | number |
| `hemoglobinA1c` | `hemoglobin_a1c` | number |
| `cardiacWorkload` | `cardiac_workload` | number |
| `meanArterialPressure` | `mean_arterial_pressure` | number |
| `pulsePressure` | `pulse_pressure` | number |
| `ascvdRisk` | `ascvd_risk` | string (percentage) |
| `ascvdRiskLevel` | `ascvd_risk_level` | string |
| `highBloodPressureRisk` | `high_blood_pressure_risk` | string (percentage) |
| `highFastingGlucoseRisk` | `high_fasting_glucose_risk` | string (percentage) |
| `highHemoglobinA1CRisk` | `high_hemoglobin_a1c_risk` | string (percentage) |
| `highTotalCholesterolRisk` | `high_total_cholesterol_risk` | string (percentage) |
| `lowHemoglobinRisk` | `low_hemoglobin_risk` | string (percentage) |

### Confidence Levels

Confidence levels are included when available:
- `pulse_rate_confidence`
- `respiration_rate_confidence`
- `sdnn_confidence`
- `mean_rri_confidence`
- `prq_confidence`

## Step 4: Request Format

The GALE API expects a POST request with the following JSON structure:

```json
{
  "scan_source_id": "27baa931-df23-4d18-bdb6-713acc529c88",
  "scan_source_system_name": "QHealth System",
  "scan_source_publisher": "QHealth",
  "scan_result": {
    "pulse_rate": 89,
    "respiration_rate": 15,
    "spo2": null,
    "blood_pressure_systolic": 110,
    "blood_pressure_diastolic": 70,
    "sdnn": null,
    "rmssd": null,
    "sd1": null,
    "sd2": null,
    "mean_rri": null,
    "rri": null,
    "lf_hf_ratio": null,
    "stress_level": null,
    "stress_index": null,
    "normalized_stress_index": null,
    "wellness_index": 7,
    "wellness_level": 2,
    "sns_index": null,
    "sns_zone": null,
    "pns_index": null,
    "pns_zone": null,
    "prq": 5.8,
    "hemoglobin": 12.5,
    "hemoglobin_a1c": 6.46,
    "cardiac_workload": 3.99,
    "mean_arterial_pressure": 83,
    "pulse_pressure": 40,
    "high_blood_pressure_risk": "1%",
    "high_fasting_glucose_risk": "3%",
    "high_hemoglobin_a1c_risk": "3%",
    "high_total_cholesterol_risk": "2%",
    "low_hemoglobin_risk": "1%",
    "heart_age": null,
    "ascvd_risk": null,
    "ascvd_risk_level": null,
    "pulse_rate_confidence": 1,
    "respiration_rate_confidence": 2,
    "prq_confidence": 1
  }
}
```

### Request Payload Structure

- **`scan_source_id`**: Unique session identifier (UUID format)
- **`scan_source_system_name`**: System name identifier
- **`scan_source_publisher`**: Publisher identifier
- **`scan_result`**: Object containing all vital signs and health metrics

### Field Value Types

- **Numbers**: Numeric values for measurements (e.g., `pulse_rate: 89`)
- **Null**: Fields with no data are set to `null`
- **Percentage Strings**: Risk values formatted as strings with `%` (e.g., `"1%"`)
- **Arrays**: RRI data sent as array when available
- **Confidence Levels**: Integer values (1, 2, etc.) indicating measurement confidence

## Step 5: API Request Implementation

The `sendResultsToGaleAPI()` function handles the complete API request flow:

### Function Signature

```typescript
export async function sendResultsToGaleAPI(
  results: MeasurementResults
): Promise<{ success: boolean; error?: string }>
```

### Request Flow

1. **Configuration Check**: Validates GALE API configuration is available and enabled
2. **Input Validation**: Ensures `sessionId` and `vitalSigns` are present
3. **Data Transformation**: Converts `VitalSigns` to GALE format
4. **Data Validation**: Verifies at least one field has a non-null value
5. **Payload Construction**: Builds the request payload object
6. **API Request**: Sends POST request to GALE endpoint
7. **Response Processing**: Handles success and error responses

### API Endpoint

```
POST {baseURL}/api/external/test_patient/scan/rppg/save
```

### Request Headers

```typescript
{
  "Content-Type": "application/json",
  "x-api-key": "{apiToken}"
}
```

### Implementation Code

```typescript
const endpoint = `${config.baseURL}/api/external/test_patient/scan/rppg/save`

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": config.apiToken,
  },
  body: JSON.stringify(payload),
})
```

## Step 6: Error Handling

The integration includes comprehensive error handling:

### Validation Errors

- **Missing Configuration**: Returns `{ success: false, error: "GALE API not configured" }`
- **Missing Session ID**: Throws error if `sessionId` is empty
- **Missing Vital Signs**: Throws error if `vitalSigns` is not provided
- **No Data Available**: Returns error if all scan result fields are `null`

### API Errors

- **HTTP Errors**: Catches non-OK responses and extracts error messages
- **JSON Parse Errors**: Handles malformed JSON responses gracefully
- **Network Errors**: Catches fetch failures and connection issues

### Error Response Format

```typescript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

**Note**: Errors are caught and returned without throwing to prevent blocking the user experience. The function fails silently to allow the application to continue functioning even if GALE API is unavailable.

## Step 7: Integration Points

### Where It's Called

The `sendResultsToGaleAPI()` function is called from:

- **`src/components/Monitor.tsx`**: After measurement completion and data collection

### Integration Code Example

```typescript
import { sendResultsToGaleAPI } from "../services/galeExternalAPI"

// After measurement completes
const measurementResults: MeasurementResults = {
  sessionId: sessionId,
  vitalSigns: finalVitalSigns,
  timestamp: Date.now(),
}

await sendResultsToGaleAPI(measurementResults)
```

### Integration with inappbrowser

When the QHealth application is embedded in a React Native app using **inappbrowser** (react-native-inappbrowser-reborn), the web application runs inside Chrome Custom Tabs. The GALE API integration works seamlessly in this environment:

1. **Measurement Execution**: User performs health scan in the embedded web view
2. **Data Collection**: Vital signs are collected during the scan
3. **API Transmission**: Data is sent to GALE API using standard fetch API
4. **Response Handling**: Success/error responses are processed

The inappbrowser environment provides full web API support, including:
- Fetch API for HTTP requests
- JSON parsing and stringification
- Environment variable access (via webpack DefinePlugin or dotenv)

## Step 8: Testing the Integration

### Manual Testing Steps

1. **Configure Environment**: Set up all required environment variables
2. **Start Application**: Launch the QHealth web application
3. **Perform Measurement**: Complete a health scan session
4. **Monitor Network**: Check browser DevTools Network tab for API request
5. **Verify Payload**: Confirm request payload matches expected format
6. **Check Response**: Verify successful response from GALE API

### Testing Checklist

- [ ] Environment variables are correctly configured
- [ ] API endpoint URL is correct
- [ ] API token is valid and has proper permissions
- [ ] Request payload contains all required fields
- [ ] Data transformation correctly maps all vital signs
- [ ] Error handling works for various failure scenarios
- [ ] Response is properly processed

### Debugging

Enable console logging (uncomment console.log statements in `galeExternalAPI.ts`) to debug:

- Configuration loading
- Data transformation process
- Request payload structure
- API response details
- Error messages

## Troubleshooting

### Common Issues and Solutions

- **"GALE API not configured" Error**:
  - Verify environment variables are set correctly
  - Check that `GALE_API_ENABLED` is not set to `"false"`
  - Ensure `GALE_API_BASE_URL` and `GALE_API_KEY` are provided

- **"No vital signs data available to send" Error**:
  - Verify measurement completed successfully
  - Check that at least one vital sign has a non-null value
  - Ensure vital signs are enabled (`isEnabled: true`)

- **API Request Fails with 401/403**:
  - Verify API token is correct and not expired
  - Check that `x-api-key` header is being sent
  - Confirm API token has proper permissions

- **API Request Fails with 400**:
  - Validate request payload structure matches expected format
  - Check that required fields (`scan_source_id`, `scan_source_system_name`, `scan_source_publisher`) are present
  - Verify data types match expected format (numbers vs strings)

- **Network Errors**:
  - Check internet connectivity
  - Verify API endpoint URL is accessible
  - Check for CORS issues (should not occur with proper API configuration)

- **Data Transformation Issues**:
  - Verify internal `VitalSigns` structure matches expected format
  - Check that helper functions are correctly extracting values
  - Ensure special cases (blood pressure, risk values) are handled correctly

### Additional Tips

- **Environment Variables**: Use `.env` file for local development, configure in deployment platform (Vercel, etc.) for production
- **API Token Security**: Never commit API tokens to version control
- **Error Logging**: Consider implementing proper logging service for production error tracking
- **Retry Logic**: For production, consider adding retry logic for transient failures
- **Rate Limiting**: Be aware of GALE API rate limits if applicable

## Response Format

### Success Response

The GALE API returns a JSON response on success:

```json
{
  "success": true,
  "message": "Scan results saved successfully"
}
```

### Error Response

Error responses may include:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Security Considerations

1. **API Token Protection**: API tokens are stored in environment variables and never exposed in client-side code
2. **HTTPS Only**: All API requests use HTTPS for secure transmission
3. **Input Validation**: All input data is validated before sending to API
4. **Error Message Sanitization**: Error messages don't expose sensitive information

## Resources

- [GALE API Documentation](https://gale-api-docs.example.com) - Official GALE API documentation
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - Web Fetch API reference
- [React Native InAppBrowser](https://github.com/proyecto26/react-native-inappbrowser) - InAppBrowser library documentation
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language reference

## Summary

This integration guide provides complete documentation on how the QHealth web application sends measurement data to the GALE External API. The integration:

- Transforms internal data structures to GALE API format
- Validates all data before transmission
- Handles errors gracefully without blocking user experience
- Works seamlessly in both web browser and inappbrowser (React Native) environments
- Provides comprehensive error handling and debugging capabilities

For questions or issues, refer to the troubleshooting section or consult the GALE API documentation.

