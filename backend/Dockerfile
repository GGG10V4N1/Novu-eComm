# ===== Stage 1: Build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Directorio para imagenes subidas por usuarios (persistente en Render via Disk)
RUN mkdir -p /app/images
VOLUME ["/app/images"]

# Copiar el JAR construido en el stage de build
COPY --from=build /app/target/eComm-0.0.1-SNAPSHOT.jar app.jar

# Variables de entorno por defecto (Render las sobreescribe con Env Vars)
# Heap modesto pero suficiente para Spring Boot con 512MB total de RAM
ENV SERVER_PORT=8080 \
    JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${SERVER_PORT:-8080}"]
