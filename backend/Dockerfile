# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Directorio para imágenes subidas (montado como volumen persistente)
RUN mkdir -p /app/images
VOLUME ["/app/images"]

# Copiar el JAR construido
COPY --from=build /app/target/eComm-0.0.1-SNAPSHOT.jar app.jar

# Variables de entorno por defecto (se sobreescriben con fly secrets)
ENV SERVER_PORT=8080 \
    JAVA_OPTS="-Xmx256m -Xms128m"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=$SERVER_PORT"]
