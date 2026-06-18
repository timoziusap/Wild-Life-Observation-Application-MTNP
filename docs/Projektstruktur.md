# Wildlife Observation App – Projektstruktur

## Tech Stack

| Bereich           | Technologie                        |
|-------------------|------------------------------------|
| IDE               | Spring Tools Suite (STS / Eclipse) |
| Backend           | Java 25 + Spring Boot 4.0.5        |
| Frontend          | HTML / CSS / JavaScript + jQuery   |
| Datenbank         | HSQLDB (file-basiert, kein Setup)  |
| API-Testing       | Postman                            |
| Versionskontrolle | Git + GitHub                       |

---

## Ordnerstruktur

Das Frontend liegt **innerhalb** des Spring Boot Projekts unter `src/main/resources/static/`.
Spring Boot serviert es automatisch – kein separater Server, kein CORS-Problem.

```
Wild-Life-Observation-Application-MTNP/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── hs/aalen/wildlifeobservation/
│   │   │       │
│   │   │       ├── genus/
│   │   │       │   ├── Genus.java                  ← Entity
│   │   │       │   ├── GenusRepository.java         ← DB-Zugriff
│   │   │       │   ├── GenusService.java            ← Business-Logik
│   │   │       │   └── GenusController.java         ← REST-Endpunkte
│   │   │       │
│   │   │       ├── animal/
│   │   │       │   ├── Animal.java
│   │   │       │   ├── AnimalRepository.java
│   │   │       │   ├── AnimalService.java
│   │   │       │   └── AnimalController.java
│   │   │       │
│   │   │       ├── location/
│   │   │       │   ├── Location.java
│   │   │       │   ├── LocationRepository.java
│   │   │       │   ├── LocationService.java
│   │   │       │   └── LocationController.java
│   │   │       │
│   │   │       ├── observation/
│   │   │       │   ├── Observation.java
│   │   │       │   ├── ObservationRepository.java
│   │   │       │   ├── ObservationService.java
│   │   │       │   └── ObservationController.java
│   │   │       │
│   │   │       └── WildlifeObservationApplication.java   ← Main-Klasse
│   │   │
│   │   └── resources/
│   │       ├── static/                          ← Frontend (von Spring Boot automatisch serviert)
│   │       │   ├── index.html                   ← Startseite mit Navigation zu den 3 Dialogen
│   │       │   ├── css/
│   │       │   │   └── style.css                ← Globale Styles
│   │       │   └── js/
│   │       │       ├── api.js                   ← Zentrale AJAX-Funktionen (fetch-Aufrufe)
│   │       │       ├── animal.js                ← Dialog 1: Tier anlegen/bearbeiten/löschen
│   │       │       ├── location.js              ← Dialog 2: Standort anlegen/bearbeiten/löschen
│   │       │       ├── observation.js           ← Dialog 3: Beobachtung erfassen
│   │       │       └── maps.js                  ← Leaflet/Google Maps Integration
│   │       │
│   │       └── application.properties           ← HSQLDB-Konfiguration
│   │
│   └── test/
│       └── java/hs/aalen/wildlifeobservation/
│           └── WildlifeObservationApplicationTests.java
│
├── postman/
│   └── WildlifeApp_API.json                     ← Postman Collection (committen!)
│
├── docs/
│   └── Projektstruktur.md                       ← Diese Datei
│
├── .gitignore
├── pom.xml
└── README.md
```

---

## Datenmodell (korrigiert nach Aufgaben-ERM)

> **Wichtig:** `Gender`, `EstimatedAge`, `EstimatedSize`, `EstimatedWeight` gehören zum **Animal**,
> nicht zur Observation. Observation enthält nur `Date` und `Time` als eigene Felder.

```java
// Genus.java – Tiergattung (z.B. "Cervidae")
@Entity
public class Genus {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String designation;         // z.B. "Hirsche"
    private String latinDesignation;    // z.B. "Cervidae"
}

// Animal.java – Einzelnes Tier
@Entity
public class Animal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String gender;              // Geschlecht
    private Double estimatedAge;        // Geschätztes Alter
    private Double estimatedSize;       // Geschätzte Größe
    private Double estimatedWeight;     // Geschätztes Gewicht

    @ManyToOne
    @JoinColumn(name = "genus_id")
    private Genus genus;                // Gehört zu einer Gattung
}

// Location.java – Beobachtungsstandort
@Entity
public class Location {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lnr;
    private String shortTitle;          // Kurzbezeichnung
    private String description;         // Beschreibung
    private Double latitude;            // Breitengrad (für Karte)
    private Double longitude;           // Längengrad (für Karte)
}

// Observation.java – Beobachtungseintrag (N:M Animal <-> Location)
@Entity
public class Observation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;             // Datum der Beobachtung
    private LocalTime time;             // Uhrzeit der Beobachtung

    @ManyToOne
    @JoinColumn(name = "animal_id")
    private Animal animal;              // Welches Tier wurde gesehen

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;          // Wo wurde es gesehen
}
```

---

## application.properties

```properties
# Server
server.port=8080

# HSQLDB – file-basiert (Daten bleiben nach Neustart erhalten!)
spring.datasource.driver-class-name=org.hsqldb.jdbc.JDBCDriver
spring.datasource.url=jdbc:hsqldb:file:~/wildlifedb
spring.datasource.username=sa
spring.datasource.password=

# JPA / Hibernate
spring.jpa.generate-ddl=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## pom.xml – Dependencies

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.5</version>
</parent>

<properties>
    <java.version>25</java.version>
</properties>

<dependencies>
    <!-- Spring Boot Web (REST API mit @RestController) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Data JPA (Datenbankzugriff) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- HSQLDB (file-basierte eingebettete Datenbank) -->
    <dependency>
        <groupId>org.hsqldb</groupId>
        <artifactId>hsqldb</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Tests -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## REST API Endpunkte

| Methode | Endpunkt                  | Beschreibung                    |
|---------|---------------------------|---------------------------------|
| GET     | /genus                    | Alle Gattungen abrufen          |
| GET     | /genus/{id}               | Eine Gattung abrufen            |
| POST    | /genus                    | Gattung erstellen               |
| PUT     | /genus/{id}               | Gattung aktualisieren           |
| DELETE  | /genus/{id}               | Gattung löschen                 |
| GET     | /animals                  | Alle Tiere abrufen              |
| GET     | /animals/{id}             | Ein Tier abrufen                |
| POST    | /animals                  | Tier erstellen                  |
| PUT     | /animals/{id}             | Tier aktualisieren              |
| DELETE  | /animals/{id}             | Tier löschen                    |
| GET     | /locations                | Alle Standorte abrufen          |
| GET     | /locations/{id}           | Einen Standort abrufen          |
| POST    | /locations                | Standort erstellen              |
| PUT     | /locations/{id}           | Standort aktualisieren          |
| DELETE  | /locations/{id}           | Standort löschen                |
| GET     | /observations             | Alle Beobachtungen abrufen      |
| GET     | /observations/{id}        | Eine Beobachtung abrufen        |
| POST    | /observations             | Beobachtung erfassen            |
| PUT     | /observations/{id}        | Beobachtung aktualisieren       |
| DELETE  | /observations/{id}        | Beobachtung löschen             |

---

## .gitignore

```
# Spring Tools / Eclipse
.classpath
.project
.settings/
.springBeans

# Maven Build
target/
*.class

# Spring Boot
*.jar
*.war

# HSQLDB Datenbankdateien
*.lck
*.log
*.properties.bak
wildlifedb.*

# OS
.DS_Store
Thumbs.db
```

---

## Git Workflow im Team

```bash
# Einmalig: Repo klonen
git clone https://github.com/REPO/Wild-Life-Observation-Application-MTNP.git

# Vor jedem Arbeiten: Aktuellen Stand holen
git pull

# Eigenen Feature-Branch erstellen
git checkout -b feature/animal-controller

# Nach Änderungen: Committen und pushen
git add .
git commit -m "feat: AnimalController implementiert"
git push origin feature/animal-controller
# → Pull Request auf GitHub erstellen → mergen
```

### Commit-Konventionen
```
feat:     Neue Funktion hinzugefügt
fix:      Bugfix
refactor: Code umstrukturiert (keine neuen Features)
test:     Tests hinzugefügt oder angepasst
docs:     Nur Dokumentation geändert
```

### Wichtig: Git-Config pro Person einrichten!
Jeder muss **einmalig** seinen Namen und E-Mail setzen – sonst ist im Commit-Verlauf
nicht erkennbar wer was gemacht hat (zählt zur Bewertung!):

```bash
git config --global user.name "Vorname Nachname"
git config --global user.email "deine@email.de"
```

---

## Aufgabenverteilung (Phase 1 zuerst – rest parallel möglich)

| Phase | Aufgabe                              | Hauptverantwortlich | Unterstützung |
|-------|--------------------------------------|---------------------|---------------|
| 1     | Projekt-Setup (pom.xml, properties)  |                     |               |
| 1     | Genus + Animal Entity                |                     |               |
| 1     | Location + Observation Entity        |                     |               |
| 2     | Genus + Animal API (R/S/C)           |                     |               |
| 2     | Location API (R/S/C)                 |                     |               |
| 3     | Observation API (R/S/C)              |                     |               |
| 3     | Dialog 1 – Tier anlegen (Frontend)   |                     |               |
| 3     | Dialog 2 – Standort anlegen (Frontend)|                    |               |
| 4     | Dialog 3 – Beobachtung (Frontend)    |                     |               |
| 4     | Karte (Leaflet/Google Maps)          |                     |               |
| 4     | CSS / Webdesign                      |                     |               |
| 5     | Postman Collection + API-Tests       |                     |               |
| 5     | Gesamttest + PowerPoint              |                     |               |
