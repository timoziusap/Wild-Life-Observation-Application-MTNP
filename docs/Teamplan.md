# 🦁 Wild Life Observation App – Teamplan

**Hochschule Aalen | Informationssystementwicklung | Prof. Dr. Marc Fernandes**  
**Team:** Timo · Marius · Niclas · Pascal

---

## Was wir bauen

Eine Web-App zur Erfassung von Tierbeobachtungen.  
**3 Dialoge** über einen Webclient, Daten landen in einer Datenbank über eine REST API.

- **Dialog 1** – Tier anlegen (mit Gattung)
- **Dialog 2** – Beobachtungsort anlegen (mit GPS-Koordinaten für Karte)
- **Dialog 3** – Beobachtung erfassen (Tier + Ort + Datum/Uhrzeit)

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| IDE | Spring Tools Suite (STS) |
| Backend | Java 25 + Spring Boot 4.0.5 |
| Frontend | HTML / CSS / JavaScript + jQuery |
| Datenbank | HSQLDB (file-basiert, kein Setup nötig) |
| API-Testing | Postman |
| Versionskontrolle | Git + GitHub |

---

## Reihenfolge – was wann passieren muss

### 🔒 Phase 1 – ZUERST (Blocker!)
> Solange das nicht fertig ist, kann niemand anderes anfangen!

- [ ] **Projekt-Setup** – pom.xml, application.properties, Package-Struktur
- [ ] **Genus.java** – id, designation, latinDesignation
- [ ] **Animal.java** – id, gender, estimatedAge, estimatedSize, estimatedWeight, @ManyToOne Genus
- [ ] **Location.java** – lnr, shortTitle, description, latitude, longitude
- [ ] **Observation.java** – id, date, time, @ManyToOne Animal, @ManyToOne Location

---

### ⚡ Phase 2 – Parallel möglich (2 Personen gleichzeitig)

- [ ] **Genus + Animal API** – Repository, Service, Controller (GET/POST/PUT/DELETE)
- [ ] **Location API** – Repository, Service, Controller (GET/POST/PUT/DELETE)

---

### ⚡ Phase 3 – Parallel möglich (3–4 Personen gleichzeitig)

- [ ] **Observation API** – Repository, Service, Controller (GET/POST/PUT/DELETE)
- [ ] **Dialog 1 + 2 Frontend** – HTML Formulare + Tabellen + AJAX (animal.js, location.js, api.js)

---

### ⚡ Phase 4 – Parallel möglich (2 Personen gleichzeitig)

- [ ] **Dialog 3 Frontend** – Beobachtung erfassen (observation.js)
- [ ] **Karte + CSS** – Leaflet/Google Maps Integration + finales Design (maps.js, style.css)

---

### ✅ Phase 5 – Abschluss

- [ ] **Testing** – alle Endpunkte mit Postman, kompletter Durchlauf aller 3 Dialoge
- [ ] **PowerPoint** – Präsentation erstellen
- [ ] **Git-Check** – alle 4 Namen + E-Mails in der History sichtbar?

---

## Aufgabenverteilung

| Phase | Aufgabe | Zuständig | Unterstützung |
|---|---|---|---|
| 1 | Projekt-Setup | | |
| 1 | Entities (Genus, Animal, Location, Observation) | | |
| 2 | Genus + Animal API | | |
| 2 | Location API | | |
| 3 | Observation API | | |
| 3 | Dialog 1 + 2 (Frontend) | | |
| 4 | Dialog 3 (Frontend) | | |
| 4 | Karte + CSS | | |
| 5 | Testing + Postman | | |
| 5 | PowerPoint + Git-Check | | |

---

## Wichtige Regeln

**Git-Config einmalig setzen – jeder! (wird bewertet!)**
```bash
git config --global user.name "Vorname Nachname"
git config --global user.email "deine@email.de"
```

**Vor jedem Arbeiten:**
```bash
git pull
```

**Commit-Konventionen:**
```
feat:     Neue Funktion
fix:      Bugfix
refactor: Umstrukturierung
test:     Tests
docs:     Dokumentation
```

**Feature-Branches nutzen:**
```bash
git checkout -b feature/animal-controller
# ... arbeiten ...
git add .
git commit -m "feat: AnimalController implementiert"
git push origin feature/animal-controller
```

---

## Datenmodell (kurz)

```
Genus ──< Animal >──< Observation >──< Location
         (1:N)         (N:M mit Date+Time)
```

- `Genus` → ID, Bezeichnung, Lateinische Bezeichnung
- `Animal` → ID, Geschlecht, Alter/Größe/Gewicht (geschätzt), gehört zu Genus
- `Location` → LNr, Kurzbezeichnung, Beschreibung, Latitude, Longitude
- `Observation` → ID, Datum, Uhrzeit, welches Tier, welcher Ort

---

## Repo

🔗 https://github.com/Wild-Life-Observation-Application-MTNP
