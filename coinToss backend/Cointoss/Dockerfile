FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy only pom.xml first to leverage Docker layer caching
COPY pom.xml .

# Install Maven (avoid relying on .mvn wrapper directory)
RUN apt-get update \
    && apt-get install -y --no-install-recommends maven \
    && rm -rf /var/lib/apt/lists/*

# Pre-download dependencies for faster subsequent builds
RUN mvn -B -q -DskipTests dependency:go-offline

# Copy application source
COPY src ./src

# Build the application
RUN mvn -B -DskipTests clean package

# Expose and honor PORT
EXPOSE 8080
ENV PORT=8080

CMD ["java", "-Dserver.port=${PORT}", "-jar", "target/Cointoss-0.0.1-SNAPSHOT.jar"]