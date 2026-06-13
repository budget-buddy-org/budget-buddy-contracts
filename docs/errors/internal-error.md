# Internal Server Error

**HTTP status:** `500 Internal Server Error`
**`type` URI:** `https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/internal-error.md`

## What it means

An unexpected error occurred on the server. This is not caused by the content of the request. The `errors` array is never present. `detail` contains a generic message safe for display; the root cause is logged server-side.

## Causes

| Cause | Notes |
|-------|-------|
| Database connectivity issue | Transient; retry with exponential back-off |
| Unhandled exception | A code path the server did not anticipate |
| Identity provider unreachable | Only during `DELETE /v1/users/me` — the IDP call is required before local data is deleted; if it fails, no data is deleted and 500 is returned so the client can retry |

## Response shape

```json
{
  "type": "https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/internal-error.md",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Please try again later."
}
```

## How to fix

Retry with exponential back-off for transient failures. If the problem persists across retries, the issue is on the server side and not actionable by the client — surface a user-friendly message and optionally report the `instance` value (if present) to support for tracing.
