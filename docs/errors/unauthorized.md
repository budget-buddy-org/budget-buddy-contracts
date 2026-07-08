# Unauthorized

**HTTP status:** `401 Unauthorized`
**`type` URI:** `https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/unauthorized.md`

## What it means

The request could not be authenticated. Every endpoint in this API requires a valid OIDC-issued JWT access token provided as:

```
Authorization: Bearer <jwt>
```

## Causes

| Trigger | Notes |
|---------|-------|
| `Authorization` header absent | No credentials were sent |
| Token malformed or tampered | Signature verification failed |
| Token issued by an untrusted provider | The identity provider is not configured in the server |
| Token expired | JWTs have a finite `exp` claim; re-authenticate to get a fresh token |

## Response shape

```json
{
  "type": "https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/unauthorized.md",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Bearer token is missing or invalid."
}
```

## How to fix

Re-authenticate with the identity provider (Zitadel OIDC) to obtain a fresh access token, then retry the request with the new token. There are no login endpoints in this API — the auth flow is handled out-of-band.
