# Gattungen (Genus) befuellen + Autovervollstaendigung

Ziel: Das Gattungs-Dropdown in Dialog 1 soll vorgefuellte Eintraege haben,
und beim Tippen (z.B. "F" -> "Fuchs") soll vorgeschlagen werden, aber man
soll auch eigene Gattungen eintippen koennen.

Loesung in drei Teilen:
1. Startdaten per `data.sql` (Backend) -> Liste ist sofort gefuellt.
2. `<datalist>` im Frontend (Niclas) -> Tippen + Vorschlaege + Freitext.
3. Optional: Freitext, der noch nicht existiert, per POST /genus anlegen (animal.js).

---

## 1. Startdaten: src/main/resources/data.sql

Diese Datei legt beim Start die Gattungen an. Liste = haeufige mitteleuropaeische
Saeugetiere + Voegel. Alles weitere kann ueber Freitext ergaenzt werden.

```sql
-- Saeugetiere
INSERT INTO genus (designation, latin_designation) VALUES ('Fuchs', 'Vulpes');
INSERT INTO genus (designation, latin_designation) VALUES ('Reh', 'Capreolus');
INSERT INTO genus (designation, latin_designation) VALUES ('Rothirsch', 'Cervus');
INSERT INTO genus (designation, latin_designation) VALUES ('Damhirsch', 'Dama');
INSERT INTO genus (designation, latin_designation) VALUES ('Wildschwein', 'Sus');
INSERT INTO genus (designation, latin_designation) VALUES ('Dachs', 'Meles');
INSERT INTO genus (designation, latin_designation) VALUES ('Feldhase', 'Lepus');
INSERT INTO genus (designation, latin_designation) VALUES ('Eichhoernchen', 'Sciurus');
INSERT INTO genus (designation, latin_designation) VALUES ('Igel', 'Erinaceus');
INSERT INTO genus (designation, latin_designation) VALUES ('Steinmarder', 'Martes');
INSERT INTO genus (designation, latin_designation) VALUES ('Iltis', 'Mustela');
INSERT INTO genus (designation, latin_designation) VALUES ('Fischotter', 'Lutra');
INSERT INTO genus (designation, latin_designation) VALUES ('Biber', 'Castor');
INSERT INTO genus (designation, latin_designation) VALUES ('Waschbaer', 'Procyon');
INSERT INTO genus (designation, latin_designation) VALUES ('Luchs', 'Lynx');
INSERT INTO genus (designation, latin_designation) VALUES ('Wolf', 'Canis');
INSERT INTO genus (designation, latin_designation) VALUES ('Gaemse', 'Rupicapra');
INSERT INTO genus (designation, latin_designation) VALUES ('Maulwurf', 'Talpa');

-- Voegel
INSERT INTO genus (designation, latin_designation) VALUES ('Buntspecht', 'Dendrocopos');
INSERT INTO genus (designation, latin_designation) VALUES ('Maeusebussard', 'Buteo');
INSERT INTO genus (designation, latin_designation) VALUES ('Graureiher', 'Ardea');
INSERT INTO genus (designation, latin_designation) VALUES ('Stockente', 'Anas');
INSERT INTO genus (designation, latin_designation) VALUES ('Habicht', 'Accipiter');
INSERT INTO genus (designation, latin_designation) VALUES ('Turmfalke', 'Falco');
INSERT INTO genus (designation, latin_designation) VALUES ('Uhu', 'Bubo');
INSERT INTO genus (designation, latin_designation) VALUES ('Waldkauz', 'Strix');
INSERT INTO genus (designation, latin_designation) VALUES ('Eichelhaeher', 'Garrulus');
INSERT INTO genus (designation, latin_designation) VALUES ('Amsel', 'Turdus');
INSERT INTO genus (designation, latin_designation) VALUES ('Kohlmeise', 'Parus');
INSERT INTO genus (designation, latin_designation) VALUES ('Star', 'Sturnus');
INSERT INTO genus (designation, latin_designation) VALUES ('Weissstorch', 'Ciconia');
INSERT INTO genus (designation, latin_designation) VALUES ('Kranich', 'Grus');
INSERT INTO genus (designation, latin_designation) VALUES ('Kolkrabe', 'Corvus');
```

## 2. Wichtig: application.properties

Damit `data.sql` erst NACH dem Anlegen der Tabellen laeuft:

```
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
```

### Achtung Duplikate
Die DB ist file-basiert (`~/wildlifedb`) und bleibt erhalten. `data.sql` laeuft
aber bei jedem Start -> sonst werden die Gattungen jedes Mal erneut eingefuegt.
Zwei saubere Optionen:

- **Demo-Variante (einfach):** In der Entwicklung `spring.jpa.hibernate.ddl-auto=create`
  setzen. Dann wird die DB bei jedem Start neu aufgebaut und `data.sql` befuellt
  sie frisch. Nachteil: selbst angelegte Testdaten sind nach Neustart weg.
- **Sauber:** `data.sql` nur einmalig laufen lassen (danach `spring.sql.init.mode=never`),
  oder die INSERTs mit einer Pruefung versehen, ob die Gattung schon existiert.

Fuer die Demo reicht die erste Variante meist.

---

## 3. Frontend: Datalist (Niclas, index.html / animal.js)

Statt eines `<select>` ein Eingabefeld mit Vorschlagsliste. Tippen filtert,
Freitext ist erlaubt:

```html
<label>Gattung (Genus):</label>
<input list="genusOptions" name="genus" id="genusInput" required="required"
       placeholder="z.B. Fuchs">
<datalist id="genusOptions">
    <!-- wird per AJAX aus GET /genus gefuellt (designation als Vorschlag) -->
</datalist>
```

In animal.js die Optionen aus /genus laden und als <option> in die datalist haengen
(aehnlich wie fillDropdown, nur in <datalist> statt <select>).

### Optional: unbekannte Gattung automatisch anlegen
Beim Speichern pruefen, ob der eingegebene Name schon in /genus existiert.
Falls nicht: per POST /genus anlegen, die zurueckgegebene id verwenden, dann
das Tier mit dieser id speichern. So muss man nicht alle Gattungen vorher kennen.

---

## Hinweis zur Vollstaendigkeit
Eine vollstaendige offizielle Gattungsliste gibt es nicht praktikabel
(die Taxonomie umfasst zehntausende Gattungen). Halb-offizielle Referenzen
fuer Deutschland: jagdbare Arten nach Bundesjagdgesetz, Artenlisten des
Bundesamts fuer Naturschutz (BfN). Fuer die App genuegt die kuratierte Liste
oben plus die Freitext-Eingabe fuer alles Weitere.
