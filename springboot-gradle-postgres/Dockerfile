# =============================================================================
# Stage 1 — builder
# Uses the official Gradle image so no local Gradle installation is required.
# The Gradle daemon is disabled (--no-daemon) to avoid memory issues in
# ephemeral build containers.
# =============================================================================
FROM gradle:8.10-jdk21-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to exploit Docker layer caching:
# if build.gradle / settings.gradle have not changed, the dependency-download
# layer is reused and the full build is faster on subsequent runs.
COPY build.gradle settings.gradle ./

# Copy the full source tree
COPY src ./src

# Build the fat JAR, skipping tests to keep the image build fast.
# Tests should be run in CI before building the production image.
RUN gradle bootJar --no-daemon -x test

# =============================================================================
# Stage 2 — production runtime
# Uses a minimal JRE-only image (no JDK / Gradle) to keep the final image small
# and reduce the attack surface.
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

# Create a dedicated non-root user and group so the JVM process does not run
# as root inside the container (principle of least privilege).
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the compiled JAR from the builder stage
COPY --from=builder /app/build/libs/inventory.jar /app/inventory.jar

# Ensure the non-root user owns the JAR
RUN chown appuser:appgroup /app/inventory.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/inventory.jar"]
