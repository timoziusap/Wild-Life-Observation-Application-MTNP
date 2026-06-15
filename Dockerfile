# Schritt 1: Projekt bauen mit dem Maven Wrapper (mvnw), damit wir kein extra Maven Image brauchen.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY . .
# mvnw ausfuehrbar machen (kommt von Windows oft ohne x-Recht) und bauen.
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Schritt 2: schlankes Laufzeit Image, nur die fertige jar wird uebernommen.
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Das Frontend liegt im public Ordner und wird ueber file:./public/ geladen (siehe application.properties).
# Deshalb muss der Ordner auch ins Laufzeit Image, sonst gibt die Startseite 404.
COPY --from=build /app/public ./public
EXPOSE 8080
# Render gibt den Port ueber die Umgebungsvariable PORT vor. Wenn keiner da ist, nimm 8080.
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
