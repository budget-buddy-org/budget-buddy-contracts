# Validation Error

**HTTP status:** `400 Bad Request`
**`type` URI:** `https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/validation-error.md`

## What it means

One or more request body or query parameter fields failed structural validation. The `errors` array is **always present** and contains at least one `FieldError` entry identifying the offending field and explaining what is wrong.

## Causes

| Trigger | Example |
|---------|---------|
| Required field absent | `name` missing from `CategoryWrite` |
| String too short or too long | `name: ""` (min 1) or `name` exceeds 255 chars |
| Number below minimum | `amount: 0` (min 1) or `monthlyBudget: -1` (min 0) |
| Enum value not in allowed set | `type: "OTHER"` instead of `EXPENSE` / `INCOME` |
| Invalid format | `categoryId` not a valid UUID; `date` not `YYYY-MM-DD` |
| Unknown additional property | Any extra key on a `Write` body (`additionalProperties: false`) |
| Pattern mismatch | `currency: "eur"` (must be `^[A-Z]{3}$`) |

## Response shape

```json
{
  "type": "https://github.com/budget-buddy-org/budget-buddy-contracts/blob/main/docs/errors/validation-error.md",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request contains invalid fields.",
  "errors": [
    { "field": "amount",   "message": "must be greater than or equal to 1" },
    { "field": "currency", "message": "must match \"^[A-Z]{3}$\"" }
  ]
}
```

## How to fix

Inspect each entry in `errors[]`. The `field` name matches the JSON key in your request body (or the query parameter name for query inputs). Fix each reported issue and retry the request.

## Related errors

- [Bad Request](./bad-request.md) — 400 without `errors[]`; a semantic or cross-field rule failed.
