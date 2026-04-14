# Deployment & Configuration Guide

Complete guide for configuring and deploying the Smart Campus Operations Hub.

---

## Prerequisites for Production

- Java 17+ (OpenJDK or Oracle JDK)
- MySQL 8.0+ with root access
- Node.js 16+ LTS
- npm or yarn package manager
- Git for version control
- Optional: Docker for containerization

---

## Backend Configuration

### 1. Database Setup

#### Create Database
```sql
CREATE DATABASE smart_campus_db;
USE smart_campus_db;
```

#### User Privileges
```sql
CREATE USER 'smartcampus'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON smart_campus_db.* TO 'smartcampus'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Application Properties Configuration

**File:** `backend/src/main/resources/application.properties`

#### Development Environment
```properties
# Spring Configuration
spring.application.name=smart-campus-backend
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT
app.jwtSecret=your-secret-key-minimum-32-characters-long-for-security
app.jwtExpirationMs=86400000

# Logging
logging.level.root=INFO
logging.level.com.smartcampus=DEBUG

# CORS
cors.allowedOrigins=http://localhost:3000,http://localhost:5173

# File Upload
file.upload-dir=uploads/
file.max-size=10485760
```

#### Production Environment

Create `application-prod.properties`:
```properties
# Spring Configuration
spring.application.name=smart-campus-backend-prod
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://prod-db-host:3306/smart_campus_db
spring.datasource.username=smartcampus
spring.datasource.password=production_password_here
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# JWT
app.jwtSecret=production-secret-key-change-this-for-security
app.jwtExpirationMs=86400000

# Security Headers
server.http2.enabled=true
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=keystore-password
server.ssl.key-store-type=PKCS12

# Logging
logging.level.root=WARN
logging.level.com.smartcampus=INFO
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=7

# CORS - Update for production domain
cors.allowedOrigins=https://yourdomain.com,https://www.yourdomain.com

# File Upload
file.upload-dir=/var/app/uploads/
file.max-size=10485760
```

### 3. Run Backend

#### Development
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Production
```bash
cd backend
mvn clean package -DskipTests

# Run as JAR
java -jar target/smart-campus-backend-1.0.0.jar

# Or run with specific profile
java -Dspring.profiles.active=prod -jar target/smart-campus-backend-1.0.0.jar
```

### 4. Build Optimization

Add to `pom.xml`:
```xml
<profiles>
    <profile>
        <id>prod</id>
        <properties>
            <maven.compiler.debug>false</maven.compiler.debug>
            <maven.compiler.optimize>true</maven.compiler.optimize>
        </properties>
    </profile>
</profiles>
```

Build for production:
```bash
mvn clean package -P prod -DskipTests
```

---

## Frontend Configuration

### 1. Environment Variables

**Development:** `.env`
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Smart Campus Operations Hub
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

**Production:** `.env.production`
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Smart Campus Operations Hub
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
```

### 2. Vite Configuration Update

**frontend/vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### 3. Development Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Production Build

```bash
cd frontend
npm install
npm run build
```

Output in `frontend/dist/` directory.

### 5. Serving Production Build

#### Using Node.js HTTP Server
```bash
npm install -g serve
serve -s dist -l 3000
```

#### Using Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/dist;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Docker Deployment

### 1. Backend Dockerfile

**backend/Dockerfile:**
```dockerfile
FROM maven:3.8.1-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-alpine
WORKDIR /app
COPY --from=build /app/target/smart-campus-backend-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### 2. Frontend Dockerfile

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: smart-campus-db
    environment:
      MYSQL_DATABASE: smart_campus_db
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: smartcampus
      MYSQL_PASSWORD: apppassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - smart-campus

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smart-campus-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/smart_campus_db
      SPRING_DATASOURCE_USERNAME: smartcampus
      SPRING_DATASOURCE_PASSWORD: apppassword
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - smart-campus

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: smart-campus-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - smart-campus

volumes:
  mysql_data:

networks:
  smart-campus:
    driver: bridge
```

**Start all services:**
```bash
docker-compose up -d
```

---

## SSL/TLS Configuration

### 1. Generate Self-Signed Certificate (Development)

```bash
keytool -genkey -alias tomcat -storetype PKCS12 \
  -keyalg RSA -keysize 2048 \
  -keystore keystore.p12 \
  -validity 3650 \
  -storepass password
```

### 2. Update Application Properties

```properties
server.ssl.key-store=file:keystore.p12
server.ssl.key-store-password=password
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
```

### 3. Production SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Certificate path: /etc/letsencrypt/live/yourdomain.com/
```

---

## Performance Optimization

### Backend

1. **Database Indexing:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_facility_type ON facilities(type);
CREATE INDEX idx_facility_status ON facilities(status);
```

2. **Connection Pooling:**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

3. **Caching:**
```properties
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

### Frontend

1. **Code Splitting:**
```javascript
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

2. **Image Optimization:**
- Use WebP format
- Lazy load images
- Compress images

3. **Bundle Analysis:**
```bash
npm install -D rollup-plugin-visualizer
```

---

## Monitoring & Logging

### Backend Logging

```properties
logging.level.root=WARN
logging.level.com.smartcampus=INFO
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### Frontend Error Tracking

```javascript
// Add Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project",
  environment: "production",
});
```

---

## Database Backup

### Automatic Backup Script

**backup.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="smart_campus_db"
DB_USER="smartcampus"
DB_PASSWORD="password"

mkdir -p $BACKUP_DIR

mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Health Checks

### Backend Health Endpoint

Add to dependencies:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Configuration:
```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

Test:
```bash
curl http://localhost:8080/actuator/health
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Set strong JWT secret (32+ characters)
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Review CORS settings
- [ ] Implement rate limiting
- [ ] Enable access logging
- [ ] Set up security headers

---

## Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Database connection timeout | Check network connectivity, verify credentials |
| Port already in use | Kill process using port or change port |
| Out of memory | Increase JVM heap size: `-Xmx1024m` |
| CORS errors | Verify allowed origins in SecurityConfig |
| Frontend can't reach API | Check API_URL, verify backend is running |

---

## Rollback Procedure

1. Keep backup of previous JAR
2. Stop current backend: `kill -9 <PID>`
3. Run previous version: `java -jar previous-version.jar`
4. Verify application health

---

## Version Control Best Practices

```bash
# Create release branch
git checkout -b release/1.0.0

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push to repository
git push origin v1.0.0
```

---

**Ready for deployment!** 🚀
