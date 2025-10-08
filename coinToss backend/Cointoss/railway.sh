#!/bin/bash
./mvnw clean package -DskipTests
java -jar target/Cointoss-0.0.1-SNAPSHOT.jar