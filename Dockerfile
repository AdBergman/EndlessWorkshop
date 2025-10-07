# ---------- Stage 1: Build frontend ----------
FROM node:24 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: Build backend ----------
FROM maven:4.0.0-rc-4-eclipse-temurin-25-alpine AS backend-build
WORKDIR /app

COPY pom.xml ./
COPY app/pom.xml app/pom.xml
COPY api/pom.xml api/pom.xml
COPY domain/pom.xml domain/pom.xml
COPY facade/pom.xml facade/pom.xml
COPY infrastructure/pom.xml infrastructure/pom.xml

RUN mvn dependency:go-offline -B

COPY app ./app
COPY api ./api
COPY domain ./domain
COPY facade ./facade
COPY infrastructure ./infrastructure

COPY --from=frontend-build /app/frontend/dist ./app/src/main/resources/static

RUN mvn clean package -DskipTests

# ---------- Stage 3: Run Spring Boot ----------
FROM eclipse-temurin:25-jdk AS runtime
WORKDIR /app

COPY --from=backend-build /app/app/target/app-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

# Run Spring Boot with JVM memory limits (safe for 512MB RAM)
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
