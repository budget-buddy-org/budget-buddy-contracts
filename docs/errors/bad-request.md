# Bad Request

**HTTP status:** `400 Bad Request`
**`type` URI:** `https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/bad-request.md`

## What it means

The request is semantically invalid — a logical or cross-field constraint was violated. Unlike a [Validation Error](./validation-error.md), this error cannot be attributed to a single field, so the `errors` array is **not present**. The human-readable explanation is in `detail`.

## Causes

| Endpoint | Trigger |
|----------|---------|
| `GET /v1/transactions/summary/trend` | `to` is before `from` |
| `GET /v1/transactions/summary/trend` | The range between `from` and `to` exceeds 24 months |
| `GET /v1/transactions` | `amountMax` is less than `amountMin` |

## Response shape

```json
{
  "type": "https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/bad-request.md",
  "title": "Bad Request",
  "status": 400,
  "detail": "Range between 'from' and 'to' must not exceed 24 months."
}
```

## How to fix

Read `detail` for the specific constraint that was violated and adjust the request accordingly.

## Related errors

- [Validation Error](./validation-error.md) — 400 with `errors[]`; a per-field constraint failed.
