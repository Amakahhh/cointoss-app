FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Install Maven (avoid relying on .mvn wrapper directory)
RUN apt-get update \
    && apt-get install -y --no-install-recommends maven \
    && rm -rf /var/lib/apt/lists/*

# Copy pom.xml and source from backend folder
# Handle both root context and nested context scenarios
COPY "coinToss backend/Cointoss/pom.xml" ./pom.xml
COPY "coinToss backend/Cointoss/src" ./src

# Pre-download dependencies for faster subsequent builds
RUN mvn -B -q -DskipTests dependency:go-offline

# Build the application
RUN mvn -B -DskipTests clean package

# Expose and honor PORT
EXPOSE 8080
ENV PORT=8080

CMD ["java", "-Dserver.port=${PORT}", "-jar", "target/Cointoss-0.0.1-SNAPSHOT.jar"]