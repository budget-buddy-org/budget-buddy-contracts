#!/bin/sh
set -eu

output=$(mktemp -d)
trap 'rm -rf "$output"' EXIT
openapi-generator-cli generate -i specs/openapi.yaml -g swift6 -o "$output" -c config/swift6.yaml
rsync -a --delete "$output/Sources/BudgetBuddyContracts/" Sources/BudgetBuddyContracts/
node scripts/normalize-swift-patterns.mjs
