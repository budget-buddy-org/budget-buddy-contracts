#!/bin/sh
set -eu

repository=$(mktemp -d)
trap 'rm -rf "$repository"' EXIT

artifact_version=$(node -p "require('./package.json').version")
export ORG_GRADLE_PROJECT_artifactVersion="$artifact_version"

./gradlew build publishMavenJavaPublicationToMavenLocal "-Dmaven.repo.local=$repository"
./gradlew -p tests/java-consumer clean compileJava "-Dmaven.repo.local=$repository"
