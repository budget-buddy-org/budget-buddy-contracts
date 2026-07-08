# Not Found

**HTTP status:** `404 Not Found`
**`type` URI:** `https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/not-found.md`

## What it means

The requested resource does not exist, has been deleted, or belongs to a different user. Resources are strictly scoped to the authenticated user; a resource belonging to another user returns 404 (not 403) to avoid leaking information about resource existence.

## Causes

| Endpoint | Trigger |
|----------|---------|
| `GET /v1/categories/{categoryId}` | Category does not exist or is owned by another user |
| `PUT /v1/categories/{categoryId}` | Same |
| `DELETE /v1/categories/{categoryId}` | Same |
| `GET /v1/transactions/{transactionId}` | Transaction does not exist or is owned by another user |
| `PUT /v1/transactions/{transactionId}` | Same |
| `DELETE /v1/transactions/{transactionId}` | Same |
| `GET /v1/users/me/settings/{clientId}` | No settings row has been stored for that client yet |
| `DELETE /v1/users/me/settings/{clientId}` | Same |

## Response shape

```json
{
  "type": "https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/not-found.md",
  "title": "Not Found",
  "status": 404,
  "detail": "Category 550e8400-e29b-41d4-a716-446655440000 not found."
}
```

## How to fix

Verify the ID in the path is correct and that the resource belongs to the currently authenticated user. For client settings, call `PUT /v1/users/me/settings/{clientId}` first to create the settings row before reading or deleting it.
