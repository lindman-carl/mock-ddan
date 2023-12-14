# Trend Micro Deep Discovery Analyzer mock

Author: Carl Lindman, 2023
License: MIT

This is a mock of Trend Micro Deep Discovery Analyzer (DDAN) for development purposes.

Post a file with form data to the scan endpoint.
Get a result by calling the result endpoint with the fileId.

## Usage

PNPM:

```
pnpm i
pnpm start
```

NPM:

```
npm i
npm start
```

## Endpoints

### Scan

http://localhost:3000/scan

**Request**

Form data:

```json
{
  "file": "base64 encoded file"
}
```

**Response**

```json
{
  "fileId": "fileId",
  "status": "scanning" | "done" | "error",
  "result": "clean" | "infected" | "unknown"
}
```

### Result

http://localhost:3000/result/{fileId}

**Request**

Require params **fileId**

**Response**

```json
{
  "fileId": "fileId",
  "status": "scanning" | "done" | "error",
  "result": "clean" | "infected" | "unknown"
}
```
