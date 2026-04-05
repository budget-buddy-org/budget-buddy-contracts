Run the spec linter and validator, then fix any errors found.

1. Run `npm run lint` (Spectral) and capture output
2. Run `npm run validate` (openapi-generator structural validation) and capture output
3. If both pass with no errors, report success and stop
4. For any errors:
   - Read the relevant section of `specs/openapi.yaml` before editing
   - Fix each error in place — common issues:
     - Missing `operationId`: add a camelCase one derived from the HTTP method + path (e.g. `GET /budgets/{id}` → `getBudget`)
     - Missing `tags`: add an appropriate tag matching the resource name
     - Schema type errors: check OAS 3.1 syntax (nullable uses `type: [string, "null"]`, not `nullable: true`)
     - `$ref` pointing to undefined component: add the missing schema or correct the reference path
5. Re-run both commands after fixes to confirm clean output
6. Show a summary of what was changed
