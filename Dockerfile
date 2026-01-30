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

# Frontend build output into Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist ./app/src/main/resources/static

# Build the backend (single runnable jar ends up in app/target/)
RUN mvn clean package -DskipTests

# ---------- Stage 3: Run Spring Boot ----------
FROM eclipse-temurin:25-jdk AS runtime
WORKDIR /app

# Copy the built jar regardless of version -> stable filename in runtime image
COPY --from=backend-build /app/app/target/*.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Xms256m","-Xmx512m","-XX:MaxMetaspaceSize=128m","-jar","app.jar"]