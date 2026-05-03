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

resolve_mvn() {
    find "$MAVEN_HOME" -type f -path "*/bin/mvn" 2>/dev/null | head -1
}

MVN_CMD=$(resolve_mvn)

# Empty dist dir (e.g. previous run used `jar xf` but `jar` was not installed) — redownload.
if [ -z "$MVN_CMD" ] || [ ! -x "$MVN_CMD" ]; then
    echo "Downloading Maven distribution..."
    rm -rf "$MAVEN_HOME"
    mkdir -p "$MAVEN_HOME"
    curl -fsSL "$DIST_URL" -o "/tmp/maven-dist.zip"
    if command -v unzip >/dev/null 2>&1; then
        unzip -oq "/tmp/maven-dist.zip" -d "$MAVEN_HOME"
    else
        (cd "$MAVEN_HOME" && jar xf "/tmp/maven-dist.zip")
    fi
    rm -f "/tmp/maven-dist.zip"
    MVN_CMD=$(resolve_mvn)
fi

if [ -z "$MVN_CMD" ] || [ ! -x "$MVN_CMD" ]; then
    echo "Maven Wrapper: could not locate bin/mvn under $MAVEN_HOME" >&2
    exit 1
fi

export MAVEN_PROJECTBASEDIR
exec "$MVN_CMD" "$@"
