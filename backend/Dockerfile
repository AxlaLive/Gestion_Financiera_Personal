# 1. Fase de construcción (Build)
# Usamos una imagen que tenga Maven y Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
# Compilamos saltando tests para que Render no tarde mil años
RUN mvn clean package -DskipTests

# 2. Fase de ejecución (Run)
# Usamos una imagen ligera de Java 21 para correr la app
FROM eclipse-temurin:21-jre-jammy
# Copiamos el JAR que se generó en la fase anterior
# Maven por defecto lo deja en target/ con el nombre del artifactId
COPY --from=build /target/api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Comando para arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]