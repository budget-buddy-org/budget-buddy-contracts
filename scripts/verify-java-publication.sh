#!/bin/sh
set -eu

repository=$(mktemp -d)
trap 'rm -rf "$repository"' EXIT

./gradlew build publishMavenJavaPublicationToMavenLocal "-Dmaven.repo.local=$repository"
./gradlew -p tests/java-consumer clean compileJava "-Dmaven.repo.local=$repository"
