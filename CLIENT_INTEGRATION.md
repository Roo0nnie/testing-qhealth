# QHealth Client Integration Guide

This guide explains how to integrate the QHealth measurement app into your application and access measurement results.

## Table of Contents

1. [Overview](#overview)
2. [Iframe Embedding](#iframe-embedding)
3. [Direct Embedding (Window API)](#direct-embedding-window-api)
4. [API Reference](#api-reference)
5. [Events](#events)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Overview

The QHealth app can be embedded in two ways:

1. **Iframe Embedding** (Recommended): Embed the QHealth app in an iframe and communicate via `postMessage`
2. **Direct Embedding**: Load the QHealth app directly and use the `window.QHealthAPI` object

### Configuration

The QHealth app accepts URL parameters for configuration:

- `allowedOrigin`: Comma-separated list of allowed origins for postMessage, or `*` for all origins
  - Example: `?allowedOrigin=https://your-app.com,https://app.yourdomain.com`
  - Example: `?allowedOrigin=*` (for development)
- `enableLogging`: Enable detailed console logging (default: false)
  - Example: `?enableLogging=true`
- `apiVersion`: API version to use (default: 1.0.0)
  - Example: `?apiVersion=1.0.0`

## Iframe Embedding

### Basic Setup

```html
<iframe
  id="qhealth-iframe"
  src="https://your-qhealth-app.com?allowedOrigin=https://your-app.com&enableLogging=true"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

### Listening for Events

```javascript
const ALLOWED_ORIGIN = 'https://your-qhealth-app.com';

window.addEventListener('message', (event) => {
  // Always validate origin for security
  if (event.origin !== ALLOWED_ORIGIN) {
    return;
  }

  const { type, event: eventType, payload, requestId, success, data, error } = event.data;

  // Handle events (push notifications)
  if (type === 'QHEALTH_EVENT') {
    switch (eventType) {
      case 'MEASUREMENT_STARTED':
        console.log('Measurement started:', payload);
        handleMeasurementStarted(payload);
        break;

      case 'MEASUREMENT_COMPLETE':
        console.log('Measurement complete:', payload);
        handleMeasurementComplete(payload);
        break;

      case 'MEASUREMENT_FAILED':
        console.error('Measurement failed:', payload);
        handleMeasurementFailed(payload);
        break;

      case 'SESSION_CREATED':
        console.log('Session created:', payload);
        handleSessionCreated(payload);
        break;

      case 'ERROR':
        console.error('Error:', payload);
        handleError(payload);
        break;

      default:
        console.warn('Unknown event:', eventType);
    }
  }

  // Handle responses (request/response pattern)
  if (type === 'QHEALTH_RESPONSE') {
    handleResponse(requestId, { success, data, error });
  }
});
```

### Sending Requests

```javascript
const iframe = document.getElementById('qhealth-iframe');
const pendingRequests = new Map();

// Generate UUID for request correlation
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Send request to QHealth app
function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = generateUUID();
    const request = {
      type: 'QHEALTH_REQUEST',
      requestId,
      method,
      params,
      version: '1.0.0',
      timestamp: Date.now()
    };

    // Store pending request
    pendingRequests.set(requestId, { resolve, reject });

    // Send request
    iframe.contentWindow.postMessage(request, ALLOWED_ORIGIN);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }
    }, 5000);
  });
}

// Handle response
function handleResponse(requestId, { success, data, error }) {
  const pending = pendingRequests.get(requestId);
  if (pending) {
    pendingRequests.delete(requestId);
    if (success) {
      pending.resolve(data);
    } else {
      pending.reject(new Error(error?.message || 'Request failed'));
    }
  }
}
```

### API Methods

#### Get Latest Results

```javascript
async function getLatestResults(sessionId) {
  try {
    const results = await sendRequest('GET_LATEST_RESULTS', { sessionId });
    console.log('Latest results:', results);
    return results;
  } catch (error) {
    console.error('Failed to get latest results:', error);
    throw error;
  }
}
```

#### Get Session Info

```javascript
async function getSessionInfo() {
  try {
    const sessionInfo = await sendRequest('GET_SESSION_INFO');
    console.log('Session info:', sessionInfo);
    return sessionInfo;
  } catch (error) {
    console.error('Failed to get session info:', error);
    throw error;
  }
}
```

#### Get Session Status

```javascript
async function getSessionStatus(sessionId) {
  try {
    const status = await sendRequest('GET_SESSION_STATUS', { sessionId });
    console.log('Session status:', status);
    return status;
  } catch (error) {
    console.error('Failed to get session status:', error);
    throw error;
  }
}
```

#### List All Sessions

```javascript
async function listSessions() {
  try {
    const sessions = await sendRequest('LIST_SESSIONS');
    console.log('Sessions:', sessions);
    return sessions;
  } catch (error) {
    console.error('Failed to list sessions:', error);
    throw error;
  }
}
```

#### Ping (Health Check)

```javascript
async function ping() {
  try {
    const response = await sendRequest('PING');
    console.log('Ping response:', response);
    return response;
  } catch (error) {
    console.error('Ping failed:', error);
    throw error;
  }
}
```

## Direct Embedding (Window API)

If the QHealth app is loaded directly (not in an iframe), you can use the `window.QHealthAPI` object:

```javascript
// Check if API is available
if (window.QHealthAPI) {
  const api = window.QHealthAPI;

  // Subscribe to events
  api.on('MEASUREMENT_COMPLETE', (payload) => {
    console.log('Measurement complete:', payload);
    handleMeasurementComplete(payload);
  });

  api.on('MEASUREMENT_STARTED', (payload) => {
    console.log('Measurement started:', payload);
    handleMeasurementStarted(payload);
  });

  api.on('ERROR', (payload) => {
    console.error('Error:', payload);
    handleError(payload);
  });

  // Unsubscribe from events
  const handler = (payload) => {
    console.log('Event:', payload);
  };
  api.on('MEASUREMENT_COMPLETE', handler);
  api.off('MEASUREMENT_COMPLETE', handler);

  // Query for results
  async function getLatestResults() {
    try {
      const results = await api.getLatestResults();
      console.log('Latest results:', results);
      return results;
    } catch (error) {
      console.error('Failed to get latest results:', error);
      throw error;
    }
  }

  // Get session info
  async function getSessionInfo() {
    try {
      const sessionInfo = await api.getSessionInfo();
      console.log('Session info:', sessionInfo);
      return sessionInfo;
    } catch (error) {
      console.error('Failed to get session info:', error);
      throw error;
    }
  }

  // Get session status
  async function getSessionStatus(sessionId) {
    try {
      const status = await api.getSessionStatus(sessionId);
      console.log('Session status:', status);
      return status;
    } catch (error) {
      console.error('Failed to get session status:', error);
      throw error;
    }
  }

  // List sessions
  async function listSessions() {
    try {
      const sessions = await api.listSessions();
      console.log('Sessions:', sessions);
      return sessions;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      throw error;
    }
  }

  // Ping
  async function ping() {
    try {
      const response = await api.ping();
      console.log('Ping response:', response);
      return response;
    } catch (error) {
      console.error('Ping failed:', error);
      throw error;
    }
  }
}
```

## API Reference

### Events

#### MEASUREMENT_STARTED

Fired when a measurement starts.

**Payload:**
```typescript
{
  sessionId: string;
  timestamp: number;
}
```

#### MEASUREMENT_COMPLETE

Fired when a measurement completes successfully.

**Payload:**
```typescript
{
  sessionId: string;
  vitalSigns: VitalSigns;
  timestamp: number;
}
```

#### MEASUREMENT_FAILED

Fired when a measurement fails.

**Payload:**
```typescript
{
  sessionId: string;
  error: string;
  timestamp: number;
}
```

#### SESSION_CREATED

Fired when a new session is created.

**Payload:**
```typescript
{
  sessionId: string;
  createdAt: number;
}
```

#### ERROR

Fired when an error occurs.

**Payload:**
```typescript
{
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### Request Methods

#### GET_LATEST_RESULTS

Get the latest measurement results for the current session.

**Parameters:**
```typescript
{
  sessionId?: string; // Optional, defaults to current session
}
```

**Response:**
```typescript
{
  sessionId: string;
  vitalSigns: VitalSigns;
  timestamp: number;
}
```

#### GET_RESULTS_BY_SESSION_ID

Get measurement results for a specific session.

**Parameters:**
```typescript
{
  sessionId: string; // Required
}
```

**Response:**
```typescript
{
  sessionId: string;
  vitalSigns: VitalSigns;
  timestamp: number;
}
```

#### GET_SESSION_INFO

Get information about the current session.

**Parameters:** None

**Response:**
```typescript
{
  sessionId: string;
  status: SessionStatus;
  createdAt: number;
  lastMeasurementAt?: number;
  measurementCount: number;
  expiresAt?: number;
}
```

#### GET_SESSION_STATUS

Get the status of a session.

**Parameters:**
```typescript
{
  sessionId?: string; // Optional, defaults to current session
}
```

**Response:**
```typescript
SessionStatus // 'ACTIVE' | 'MEASURING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
```

#### LIST_SESSIONS

List all available sessions.

**Parameters:** None

**Response:**
```typescript
SessionInfo[]
```

#### PING

Health check endpoint.

**Parameters:** None

**Response:**
```typescript
{
  status: 'ok';
  timestamp: number;
}
```

## Error Handling

### Error Codes

- `INVALID_REQUEST`: Invalid request format or parameters
- `UNAUTHORIZED`: Unauthorized access
- `FORBIDDEN`: Access forbidden
- `NOT_FOUND`: Resource not found
- `SESSION_NOT_FOUND`: Session not found
- `SESSION_EXPIRED`: Session has expired
- `INVALID_SESSION_ID`: Invalid session ID
- `MEASUREMENT_NOT_COMPLETE`: Measurement not yet complete
- `MEASUREMENT_IN_PROGRESS`: Measurement in progress
- `MEASUREMENT_FAILED`: Measurement failed
- `INTERNAL_ERROR`: Internal server error
- `SERVICE_UNAVAILABLE`: Service unavailable
- `TIMEOUT`: Request timeout

### Error Response Format

```typescript
{
  code: APIErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}
```

### Handling Errors

```javascript
async function handleRequest(method, params) {
  try {
    const result = await sendRequest(method, params);
    return result;
  } catch (error) {
    if (error.code === 'SESSION_NOT_FOUND') {
      console.error('Session not found');
      // Handle session not found
    } else if (error.code === 'MEASUREMENT_NOT_COMPLETE') {
      console.warn('Measurement not complete yet');
      // Retry later or show waiting message
    } else {
      console.error('Request failed:', error);
      // Handle other errors
    }
    throw error;
  }
}
```

## Examples

### Complete Integration Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>QHealth Integration Example</title>
</head>
<body>
  <h1>QHealth Integration</h1>
  
  <div id="status">Waiting for measurement...</div>
  <div id="results"></div>
  
  <iframe
    id="qhealth-iframe"
    src="https://your-qhealth-app.com?allowedOrigin=https://your-app.com&enableLogging=true"
    width="100%"
    height="600px"
    frameborder="0"
  ></iframe>

  <script>
    const ALLOWED_ORIGIN = 'https://your-qhealth-app.com';
    const iframe = document.getElementById('qhealth-iframe');
    const statusDiv = document.getElementById('status');
    const resultsDiv = document.getElementById('results');
    const pendingRequests = new Map();

    // Generate UUID
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Send request
    function sendRequest(method, params = {}) {
      return new Promise((resolve, reject) => {
        const requestId = generateUUID();
        const request = {
          type: 'QHEALTH_REQUEST',
          requestId,
          method,
          params,
          version: '1.0.0',
          timestamp: Date.now()
        };

        pendingRequests.set(requestId, { resolve, reject });

        iframe.contentWindow.postMessage(request, ALLOWED_ORIGIN);

        setTimeout(() => {
          if (pendingRequests.has(requestId)) {
            pendingRequests.delete(requestId);
            reject(new Error('Request timeout'));
          }
        }, 5000);
      });
    }

    // Handle response
    function handleResponse(requestId, { success, data, error }) {
      const pending = pendingRequests.get(requestId);
      if (pending) {
        pendingRequests.delete(requestId);
        if (success) {
          pending.resolve(data);
        } else {
          pending.reject(new Error(error?.message || 'Request failed'));
        }
      }
    }

    // Listen for messages
    window.addEventListener('message', (event) => {
      if (event.origin !== ALLOWED_ORIGIN) return;

      const { type, event: eventType, payload, requestId, success, data, error } = event.data;

      if (type === 'QHEALTH_EVENT') {
        switch (eventType) {
          case 'MEASUREMENT_STARTED':
            statusDiv.textContent = 'Measurement in progress...';
            break;

          case 'MEASUREMENT_COMPLETE':
            statusDiv.textContent = 'Measurement complete!';
            resultsDiv.innerHTML = `<pre>${JSON.stringify(payload, null, 2)}</pre>`;
            
            // Save results to your backend
            saveResultsToBackend(payload);
            break;

          case 'MEASUREMENT_FAILED':
            statusDiv.textContent = `Measurement failed: ${payload.error}`;
            break;

          case 'SESSION_CREATED':
            console.log('Session created:', payload.sessionId);
            break;

          case 'ERROR':
            statusDiv.textContent = `Error: ${payload.message}`;
            break;
        }
      }

      if (type === 'QHEALTH_RESPONSE') {
        handleResponse(requestId, { success, data, error });
      }
    });

    // Save results to backend
    async function saveResultsToBackend(results) {
      try {
        const response = await fetch('/api/measurements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(results),
        });

        if (!response.ok) {
          throw new Error('Failed to save results');
        }

        console.log('Results saved to backend');
      } catch (error) {
        console.error('Failed to save results:', error);
      }
    }

    // Query for latest results periodically
    setInterval(async () => {
      try {
        const status = await sendRequest('GET_SESSION_STATUS');
        console.log('Session status:', status);
      } catch (error) {
        console.error('Failed to get status:', error);
      }
    }, 5000);
  </script>
</body>
</html>
```

### React Integration Example

```jsx
import React, { useEffect, useState, useRef } from 'react';

const QHealthIntegration = () => {
  const [status, setStatus] = useState('Waiting for measurement...');
  const [results, setResults] = useState(null);
  const iframeRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const ALLOWED_ORIGIN = 'https://your-qhealth-app.com';

  useEffect(() => {
    // Generate UUID
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Send request
    const sendRequest = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const requestId = generateUUID();
        const request = {
          type: 'QHEALTH_REQUEST',
          requestId,
          method,
          params,
          version: '1.0.0',
          timestamp: Date.now()
        };

        pendingRequestsRef.current.set(requestId, { resolve, reject });

        iframeRef.current.contentWindow.postMessage(request, ALLOWED_ORIGIN);

        setTimeout(() => {
          if (pendingRequestsRef.current.has(requestId)) {
            pendingRequestsRef.current.delete(requestId);
            reject(new Error('Request timeout'));
          }
        }, 5000);
      });
    };

    // Handle response
    const handleResponse = (requestId, { success, data, error }) => {
      const pending = pendingRequestsRef.current.get(requestId);
      if (pending) {
        pendingRequestsRef.current.delete(requestId);
        if (success) {
          pending.resolve(data);
        } else {
          pending.reject(new Error(error?.message || 'Request failed'));
        }
      }
    };

    // Message handler
    const handleMessage = (event) => {
      if (event.origin !== ALLOWED_ORIGIN) return;

      const { type, event: eventType, payload, requestId, success, data, error } = event.data;

      if (type === 'QHEALTH_EVENT') {
        switch (eventType) {
          case 'MEASUREMENT_STARTED':
            setStatus('Measurement in progress...');
            break;

          case 'MEASUREMENT_COMPLETE':
            setStatus('Measurement complete!');
            setResults(payload);
            break;

          case 'MEASUREMENT_FAILED':
            setStatus(`Measurement failed: ${payload.error}`);
            break;

          case 'ERROR':
            setStatus(`Error: ${payload.message}`);
            break;
        }
      }

      if (type === 'QHEALTH_RESPONSE') {
        handleResponse(requestId, { success, data, error });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div>
      <div>{status}</div>
      {results && (
        <div>
          <h2>Results</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`https://your-qhealth-app.com?allowedOrigin=${encodeURIComponent(window.location.origin)}&enableLogging=true`}
        width="100%"
        height="600px"
        frameBorder="0"
      />
    </div>
  );
};

export default QHealthIntegration;
```

## Security Considerations

1. **Origin Validation**: Always validate the origin of messages from the iframe
2. **HTTPS**: Use HTTPS in production to ensure secure communication
3. **Allowed Origins**: Configure `allowedOrigin` parameter to restrict which origins can communicate with the QHealth app
4. **Input Validation**: Validate all data received from the QHealth app before processing

## Support

For issues or questions, please contact the QHealth support team.

