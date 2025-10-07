# Ewshop Tech Build App

**Stack:** React + Vite (Node 24) | Spring Boot (Java 24) | Docker

---

## Local Dev

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs at: http://localhost:5173
- .env should have: VITE_API_BASE_URL=http://localhost:8080/api

### Backend
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
- Runs at: http://localhost:8080
- API endpoints: /api/techs, /api/districts, /api/improvements, /api/builds/...

### Build Docker Image
```bash
docker build -t ewshop-app .
```

### Run Container
```bash
docker run -p 8080:8080 ewshop-app
```
- App accessible at: http://localhost:8080

### Logs / Debug
```bash
docker logs -f <container_id>
docker run -p 8080:8080 -it ewshop-app
```

### Notes
- Multi-stage Docker build:
- Frontend: Node 24 → build React app
- Backend: Maven 4 + Temurin 25 → build Spring Boot jar
- Runtime: Temurin 25 JDK → run jar
- React build copied into Spring Boot /static