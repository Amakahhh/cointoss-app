#!/bin/bash
./mvnw clean package -DskipTests
java -Dserver.port=${PORT:-8080} -jar target/Cointoss-0.0.1-SNAPSHOT.jar