#!/bin/sh
# Maven Wrapper script
set -e

MAVEN_PROJECTBASEDIR="${MAVEN_BASEDIR:-$(cd "$(dirname "$0")" && pwd)}"
MAVEN_WRAPPER_PROPERTIES="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"
MAVEN_WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"

if [ ! -f "$MAVEN_WRAPPER_JAR" ]; then
    WRAPPER_URL=$(grep 'wrapperUrl' "$MAVEN_WRAPPER_PROPERTIES" | cut -d'=' -f2-)
    echo "Downloading Maven Wrapper..."
    curl -sL "$WRAPPER_URL" -o "$MAVEN_WRAPPER_JAR"
fi

DIST_URL=$(grep 'distributionUrl' "$MAVEN_WRAPPER_PROPERTIES" | cut -d'=' -f2-)
DIST_NAME=$(basename "$DIST_URL" .zip)
MAVEN_HOME="$HOME/.m2/wrapper/dists/$DIST_NAME"

if [ ! -d "$MAVEN_HOME" ]; then
    echo "Downloading Maven distribution..."
    mkdir -p "$MAVEN_HOME"
    curl -sL "$DIST_URL" -o "/tmp/maven-dist.zip"
    cd "$MAVEN_HOME"
    jar xf "/tmp/maven-dist.zip"
    rm -f "/tmp/maven-dist.zip"
fi

MVN_CMD=$(find "$MAVEN_HOME" -name "mvn" -path "*/bin/mvn" | head -1)
export MAVEN_PROJECTBASEDIR
exec "$MVN_CMD" "$@"
