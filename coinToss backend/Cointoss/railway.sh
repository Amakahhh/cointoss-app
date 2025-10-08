#!/bin/bash
./mvnw clean package -DskipTests
java -Dserver.port=$PORT -jar target/Cointoss-0.0.1-SNAPSHOT.jar