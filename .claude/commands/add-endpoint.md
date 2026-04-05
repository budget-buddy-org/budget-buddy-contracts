Add a new endpoint to `specs/openapi.yaml` following project conventions.

The user will describe the endpoint they want. Based on their description:

1. Read `specs/openapi.yaml` to understand the existing structure, schemas, and patterns before making changes.

2. Add the path and operation following these conventions:
   - Every operation MUST have a unique `operationId` in camelCase (e.g. `listTransactions`, `createBudget`) — Spectral enforces this
   - Every operation MUST have at least one tag (use existing tags when applicable)
   - Include appropriate HTTP status codes for success responses
   - All error responses use `application/problem+json` with `$ref: '#/components/schemas/Problem'`
   - Monetary amounts are `integer` in minor currency units (e.g. `1299` = €12.99) — never `number` or `string`
   - Use `$ref` to reference shared schemas; never inline schemas that are reused

3. Add schemas to `components/schemas` if needed:
   - Write schemas (POST/PUT body): name them `Create<Resource>Request` or `Update<Resource>Request`
   - PATCH body schemas: name them `Patch<Resource>Request`  
   - Read schemas (response body): name them `<Resource>` or `<Resource>Response`
   - Keep write and read schemas separate

4. After editing, run `npm run lint && npm run validate` and fix any errors before finishing.

5. Report what was added: path, operationId, new schemas (if any), and remind the user to run `/release` when ready to publish.
