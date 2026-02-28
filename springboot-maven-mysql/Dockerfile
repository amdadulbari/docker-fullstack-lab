# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy the Maven descriptor first (layer caching: dependencies won't re-download
# unless pom.xml changes)
COPY pom.xml .

# Download all dependencies declared in pom.xml
RUN mvn dependency:go-offline -B

# Copy the full source tree
COPY src ./src

# Package the application, skipping tests for a faster build
RUN mvn package -DskipTests -B

# ─────────────────────────────────────────────
# Stage 2: Production runtime (minimal image)
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root system group and user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the fat JAR produced in Stage 1
COPY --from=builder /app/target/*.jar /app/app.jar

# Switch to the non-root user
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
