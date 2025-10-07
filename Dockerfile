# ---------- Stage 1: Build frontend ----------
FROM node:24 AS frontend-build

WORKDIR /app/frontend

# Copy package.json + lockfile first for caching
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ ./

# Build React app for production
RUN npm run build

# ---------- Stage 2: Build backend ----------
FROM maven:4.0.0-rc-4-eclipse-temurin-25-alpine AS backend-build

WORKDIR /app

# Copy only pom.xml files first for caching dependencies
COPY pom.xml ./
COPY app/pom.xml app/pom.xml
COPY api/pom.xml api/pom.xml
COPY domain/pom.xml domain/pom.xml
COPY facade/pom.xml facade/pom.xml
COPY infrastructure/pom.xml infrastructure/pom.xml

# Download dependencies without building the code (caches Maven deps)
RUN mvn dependency:go-offline -B

# Copy all source code
COPY app ./app
COPY api ./api
COPY domain ./domain
COPY facade ./facade
COPY infrastructure ./infrastructure

# Copy React build into app module
COPY --from=frontend-build /app/frontend/dist ./app/src/main/resources/static

# Build the backend (skip tests)
RUN mvn clean package -DskipTests

# ---------- Stage 3: Run Spring Boot ----------
FROM eclipse-temurin:25-jdk AS runtime

WORKDIR /app

# Copy the built JAR from backend-build
COPY --from=backend-build /app/app/target/app-0.0.1-SNAPSHOT.jar ./app.jar

# Expose port
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
