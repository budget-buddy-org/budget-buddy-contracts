#!/bin/sh
set -eu

repository=$(mktemp -d)
trap 'rm -rf "$repository"' EXIT

artifact_version=$(node -p "require('./package.json').version")

./gradlew build publishMavenJavaPublicationToMavenLocal "-PartifactVersion=$artifact_version" "-Dmaven.repo.local=$repository"
./gradlew -p tests/java-consumer clean compileJava "-PartifactVersion=$artifact_version" "-Dmaven.repo.local=$repository"
