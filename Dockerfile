# Build Stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p /app/data /app/uploads
COPY --from=build /app/target/studysync-api-1.0.0.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
