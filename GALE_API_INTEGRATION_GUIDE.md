# QHealth Camera Scan URL Integration Guide for Third-Party React Native Apps

This guide documents how to integrate the QHealth camera scanning URL into your React Native application and receive scan results at your GALE API endpoint.

## Overview

QHealth provides a web-based camera scanning URL that performs health measurements using rPPG (remote photoplethysmography) technology. After a user completes a scan, the results are sent directly to your GALE API endpoint. Your React Native app will open this URL using InAppBrowser.

### Key Points:

- We provide you with a dedicated scanning URL (pre-configured with your API details)
- Scan results are posted directly to your endpoint
- The integration works entirely within InAppBrowser - no native modules required

## Prerequisites

Before integration, ensure you have:

- **React Native InAppBrowser:** Installed and configured
  ```bash
  npm install react-native-inappbrowser-reborn
  ```
- **GALE API Endpoint Ready:** Your POST endpoint must be able to:
  - Receive JSON payloads
  - Validate API key authentication
  - Return JSON responses
- **Camera & Internet Permissions:** Your app must request camera permissions, and the device must maintain internet connection during scanning

## Step 1: Scanning URL Provided by QHealth

We will provide you with the following pre-configured scanning URL:

**Base URL:**

```
https://qhealth-webbased.quanbyit.com/
```

**Usage with Session ID (Recommended):**

```
https://qhealth-webbased.quanbyit.com/?session={your-unique-session-id}
```

**URL Parameters:**

- `session` (required): Your unique identifier for tracking scans

The URL is already configured with your GALE API endpoint, API key, and system identifiers (as previously provided to us)

> **Security Note:** Your API credentials are stored securely on our servers and never exposed in the URL or client-side code.

## Step 2: Implement InAppBrowser Integration

Open the scanning URL in your React Native app:

```javascript
import { InAppBrowser } from "react-native-inappbrowser-reborn";

async function openHealthScan(sessionId: string) {
  try {
    const url = `https://qhealth-webbased.quanbyit.com/?session=${sessionId}`;

    await InAppBrowser.open(url, {
      // iOS
      dismissButtonStyle: "cancel",
      preferredBarTintColor: "#453AA4",
      preferredControlTintColor: "white",

      // Android
      showTitle: true,
      toolbarColor: "#453AA4",
      secondaryToolbarColor: "white",

      // Universal
      enableUrlBarHiding: true,
      enableDefaultShare: false,
      forceCloseOnRedirection: false,

      // Important: Wait for completion
      animations: {
        startEnter: "slide_in_right",
        startExit: "slide_out_left",
        endEnter: "slide_in_left",
        endExit: "slide_out_right",
      },
    });

    // Browser closed - scan completed or cancelled
    console.log("Scan session ended");
  } catch (error) {
    console.error("Error opening scan:", error);
  }
}
```

### Important Considerations:

- The scan runs entirely in the web view
- Users need camera permissions (browser will prompt)
- Internet connection is required throughout the scan
- Do not add custom headers - authentication is handled internally

## Step 3: Data Received at Your Endpoint

After scan completion, your GALE API endpoint will receive a POST request:

**Endpoint**

```
POST {your-base-url}/api/external/test_patient/scan/rppg/save
```

**Headers**

```
Content-Type: application/json
x-api-key: {your-api-key}
```

**Payload Structure**

```json
{
  "scan_source_id": "27baa931-df23-4d18-bdb6-713acc529c88",
  "scan_source_system_name": "YourHealth System",
  "scan_source_publisher": "YourCompany",
  "scan_result": {
    "pulse_rate": 89,
    "respiration_rate": 15,
    "spo2": 12,
    "blood Pressure": '110/70',
    "sdnn": 12,
    "rmssd": 12,
    "sd1": 12,
    "sd2": 12,
    "mean_rri": 12,
    "rri": [800, 810, 805],
    "lf_hf_ratio": 12,
    "stress_level":"low",
    "stress_index": 12,
    "normalized_stress_index":12,,,
    "wellness_index": 7, 
    "wellness_level": "Low",
    "sns_index": 1,
    "sns_zone": "low",
    "pns_index":12 ,
    "pns_zone": "low",
    "prq": 5.8, 
    "hemoglobin": 12.5, 
    "hemoglobin_a1c": 6.46,
    "cardiac_workload": 3.99,
    "mean_arterial_pressure": 83, 
    "pulse_pressure": 40,
    "high_blood_pressure_risk": "Medium",
    "high_fasting_glucose_risk":"High",
    "high_hemoglobin_a1c_risk":  "High",
    "high_total_cholesterol_risk": "High",
    "low_hemoglobin_risk": "Low",
    "heart_age":23,
    "ascvd_risk": 12,
    "ascvd_risk_level": medium,
    "pulse_rate_confidence": 1,
    "respiration_rate_confidence": 2,
    "prq_confidence": 1
  }
}
```

### Field Descriptions

**Top-Level Metadata:**

- `scan_source_id`: Unique session ID for tracking
- `scan_source_system_name`: Your system name (as you provided)
- `scan_source_publisher`: Your publisher name (as you provided)

**Vital Sign Fields (in scan_result):**

- Always numeric or null: Values are numbers or null if not measured
- Risk percentages: String format with % (e.g., "1%")
- Confidence levels: Integer values (typically 1-3)
- Blood pressure: Split into systolic and diastolic fields

## Step 4: Response Format

Your endpoint must return a JSON response to acknowledge receipt:

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Scan results saved successfully"
}
```

**Error Response**

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional details (optional)"
}
```

**HTTP Status Codes**

- 200: Success
- 400: Invalid payload
- 401: Invalid API key
- 500: Server error

> **Important:** The QHealth application expects these exact response formats. Non-JSON responses will be treated as network errors.

## Step 5: Security Considerations

- **API Key Validation:** Always validate the x-api-key header
- **HTTPS Required:** Your endpoint must use HTTPS
- **Input Validation:** Validate all received fields are expected types
- **Session ID Verification:** Verify scan_source_id matches your provided session ID
- **Do Not Expose Keys:** Your API key is stored securely on our servers, never in the URL

## Step 6: Testing Checklist

Before going live, verify:

- [ ] API endpoint is accessible from the internet
- [ ] API key authentication is working
- [ ] Endpoint returns valid JSON responses
- [ ] All required fields are properly stored/processed
- [ ] InAppBrowser opens the URL successfully
- [ ] Scan completes and data is received at your endpoint
- [ ] Error responses are handled gracefully
- [ ] Session IDs are correctly tracked

### Quick Test

- Open the URL in your React Native app
- Complete a scan
- Verify data arrives at your endpoint
- Check response is processed correctly

## Troubleshooting

**Issue: API Requests Not Reaching Your Endpoint**

- _Cause:_ Network restrictions or incorrect URL.
- _Solution:_
  - Verify your endpoint is publicly accessible
  - Check firewall/Azure security rules allow traffic
  - Confirm URL format matches our specification

**Issue: 401 Unauthorized Errors**

- _Cause:_ API key mismatch.
- _Solution:_
  - Confirm the API key we have on file is correct
  - Check that your endpoint validates the x-api-key header correctly
  - Ensure no extra spaces or characters in the key

**Issue: Invalid Payload Format**

- _Cause:_ Your endpoint expects different field names or types.
- _Solution:_
  - Compare your expected format with the payload structure above
  - Note that all risk values are percentage strings, not numbers
  - Accept null values for fields that weren't measured

**Issue: Scan Completes But No Data Received**

- _Cause:_ Network error or endpoint not responding.
- _Solution:_
  - Check your server logs for incoming requests
  - Verify your endpoint returns a valid JSON response quickly (< 30s)
  - Ensure your API endpoint URL doesn't have typos

**Issue: InAppBrowser Not Opening**

- _Cause:_ Library not properly linked or permissions missing.
- _Solution:_
  - Run `react-native link react-native-inappbrowser-reborn`
  - For iOS: run `pod install` in the ios directory
  - Check AndroidManifest.xml has internet permissions
  - Verify the URL is properly encoded

## Support

For technical issues:

- **Endpoint Issues:** Check your server logs and API response format
- **URL Configuration:** Contact us to verify your configuration
- **InAppBrowser Problems:** Refer to React Native InAppBrowser documentation

### What We Need for Support:

- Your sessionId
- Timestamp of the scan
- Error messages (if any)
- Screenshots of network logs (if applicable)

## Summary

**Your Implementation is Minimal:**

- Receive the pre-configured URL from us
- Open the URL in InAppBrowser
- Handle the POST request at your endpoint
- Return JSON responses

**We Handle Everything Else:**

- Camera scanning and measurement
- Secure storage of your API credentials
- Data transformation and formatting
- API authentication
- Error handling during scanning
- Cross-platform web view compatibility

This integration requires no custom native code and works entirely through standard web APIs and HTTP requests.
