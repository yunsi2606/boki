# ==============================================================================
# Multi-stage Dockerfile for Boki Spring Boot Backend
# Optimized for cloud deployment platforms (Render, Railway, Fly.io)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage with Maven & OpenJDK 21
# ------------------------------------------------------------------------------
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# 1. Copy pom.xml first to take advantage of Docker layer caching
COPY pom.xml .

# 2. Download project dependencies (layer cached unless pom.xml changes)
RUN mvn dependency:go-offline -B || true

# 3. Copy application source code
COPY src ./src

# 4. Package production-ready executable Spring Boot JAR (skip tests)
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal, secure runtime stage with Eclipse Temurin JRE 21 Alpine
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Create non-root group and user for security
RUN addgroup -S boki && adduser -S boki -G boki

WORKDIR /app

# Copy the built executable JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Set file ownership to non-root user
RUN chown -R boki:boki /app

USER boki

# Render automatically provides the PORT environment variable (defaults to 8080)
ENV PORT=8080
EXPOSE ${PORT}

# JVM container options:
# -XX:+UseContainerSupport: respects container cgroup memory limits
# -XX:MaxRAMPercentage=75.0: allocates up to 75% of container RAM to heap, leaving 25% for JVM metaspace/threads
# -Djava.security.egd=file:/dev/./urandom: speeds up cryptographic entropy generation at startup
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Launch Spring Boot with dynamic port binding
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
