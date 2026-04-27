# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/taka-bachai-0.0.1-SNAPSHOT.jar app.jar

# Render assigns a dynamic $PORT env var. Spring already reads it via the
# server.port=${PORT:8080} expression in application.properties, so we expose
# the default and rely on the env to override at runtime.
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Use the shell form so $PORT and $JAVA_OPTS expand at container start.
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
