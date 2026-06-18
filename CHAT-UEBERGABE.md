# Projekt-Übergabe: Wild Life Observation App

Stand: 11.06.2026. Diese Datei fasst den kompletten Kontext zusammen, damit ein neuer Chat nahtlos weiterarbeiten kann.

## Projekt
- Semesterprojekt Informationssysteme, Hochschule Aalen.
- Wild Life Observation App **für Jäger in Baden-Württemberg**.
- Repo: `C:\Users\mariu\git\Wild-Life-Observation-Application-MTNP`
- GitHub: `timoziusap/Wild-Life-Observation-Application-MTNP`, Branch `main`.

## Tech-Stack
- Spring Boot 4.0.6 / Java 26, Maven Wrapper (`mvnw`).
- HSQLDB, file-basiert unter `~/wildlifedb` (jeder Entwickler hat seine eigene lokale DB).
- Statische Webdateien liegen in `public/`, werden über `file:./public/` bedient (siehe `application.properties`).
- App läuft auf `http://localhost:8080`. Start in Eclipse: Rechtsklick auf `EntwicklungVonInfoSystemenProjektApplication.java` -> Run As -> Spring Boot App.

## Team-Aufteilung
- **Marius (ich):** Frontend -> `location.js`, `maps.js`, `style.css`, Karten-Einbindung in `observation.html`.
- **Niclas:** Frontend -> `index.html`, `animal.js`, `observation.html`, `observation.js`.
- **Timo + Passi:** Backend -> Controller, Repositories, Services, `GenusSeeder`, "Sonstige Gattung"-Logik, Google-Maps-Endpoint.

## Arbeitsweise / Konventionen (WICHTIG)
- Sprache: **Deutsch**, direkt und praktisch, wenig Bindestriche.
- Code im **VideoArchive-Stil** mit einfachen Kommentaren (jQuery + $.ajax + DataTables).
- **Kleine Commits**, ein Thema pro Commit, **menschlich klingende** Commit-Nachrichten (sollen von Marius kommen können, nicht nach KI aussehen).
- **Zeitabstand** zwischen Commits ca. 15-20 Min, damit es natürlich wirkt.
- Vor jedem Push immer `git pull --no-edit`.
- **Nach `git pull` außerhalb von Eclipse:** Projekt-Refresh (F5) + App neu starten + Browser hart neu laden (Strg+F5). Sonst läuft man auf altem Build.

## Was Marius schon erledigt hat (alles gepusht)
1. `style.css`: kaputte Kommentarzeilen (nackter Text statt `/* */`) gefixt.
2. `maps.js`: Google-Maps-Logik gebaut -> `initMap()` und `zeigeOrtAufKarte(lat, lng)`.
3. `observation.html`: `maps.js` eingebunden, Google Maps wird über Backend-Endpoint `/maps-api` geladen (kein API-Key im Repo).
4. `map.html`: kurz angelegt, dann wieder entfernt (Entscheidung: Karte kommt in `observation.html` über `<div id="map">`).

## Erledigt am 10.06.2026 (alles gepusht, Commits e646c38 / f6bbd08 / 94a3544 + 3d47989)
1. **lNr-Bug gefixt** (`Location.java`): Jackson hat `getlNr`/`setlNr` nicht als Getter/Setter erkannt -> lNr fehlte im JSON (LNr-Spalte leer) und kam beim Speichern nicht an (Beobachtung speichern schlug mit 500 fehl). Fix: `@JsonProperty("lNr")` an Getter UND Setter.
2. **Dialog 3 end-to-end getestet:** Tier + Ort anlegen, Beobachtung speichern, Anzeige in Tabelle -> funktioniert (POST /observations -> 200).
3. **Tier-Dialog verbessert** (`index.html`, `animal.js`): Geschlecht als Dropdown (maennlich/weiblich/unbekannt), Alter/Groesse/Gewicht als `input type=number` mit Einheiten (Jahre/cm/kg, Gewicht mit step 0.1). Selektoren in animal.js auf `select[name=gender]` angepasst.
4. **Orte-Tabelle:** Bearbeiten- und Loeschen-Buttons ergaenzt (`location.js` + Aktion-Spalte in `index.html`). PUT/DELETE gab es im Backend schon. Bearbeiten-Modus mit `bearbeiteLnr` wie bei den Tieren.
5. **CSS Tabellen-Layout** (`style.css`): DataTables-Breite hart auf 100% (`!important`), Tabellen-Buttons klein/gleich breit/untereinander, Aktion-Spalte 110px, `.centerdiv` auf 96%, Tabellenschrift 14px, number/date/time-Inputs gestylt. Tabellen ragen nicht mehr aus den Kaesten.

## Erledigt am 11.06.2026 (alle 5 Arbeitspakete von Niclas + Bugfix, alles gepusht)
1. **AP1** (Timo gepusht, 08062ef): Tier hat jetzt `animalCount` und `youngPresent`/`youngCount`, Dialog 1 mit Anzahl-Feld und Jungtiere-Dropdown.
2. **AP2** (Niclas gepusht, 9440268): Genus hat `protectedSpecies` + `huntingSeason`, Seeder befuellt sie, Info-Box im Tier-Dialog zeigt Schutzstatus/Jagdzeit. `maps.js.backup` wurde dabei entfernt.
3. **AP3** (Marius gepusht, daf1851): `GET /observations/search` mit 6 optionalen Filtern (genusId, gender, minCount, minYoungCount, locationLnr, protectedSpecies). Getestet, funktioniert.
4. **Bugfix** (Marius gepusht, 0f23d75): AP1/AP2 hatten primitives `boolean` in Animal (`youngPresent`) und Genus (`protectedSpecies`) -> Jackson warf 400er, wenn das Feld im JSON fehlte (z.B. `genus: {id}` oder `animal: {id}`). Tier- UND Beobachtung-Speichern waren kaputt. Fix: `Boolean` statt `boolean` (Feld, Konstruktor, Setter), Getter primitiv mit Null-Check. **Wichtig falls jemand die Entities nochmal anfasst: nicht auf primitives boolean zurueckdrehen!**
5. **AP4** (Passi gepusht, 45d6c31): `search.html` + `search.js` (Dialog 4) mit allen 6 Filtern und Ergebnistabelle, Nav-Link "Suche" auf allen Seiten. Im Browser getestet.
6. **AP5** (Marius gepusht, 584c6ae): Natur-Design in `style.css` (Gruen-/Braun-/Erdtoene, Wald-Header mit Tannen-SVG als data-URI, Pillen-Nav, Naturpapier-Kaesten). Enthaelt weiterhin alle Layout-Fixes vom 10.06.
- Einmaliges DB-Reset war noetig (wildlifedb.* loeschen), damit der Seeder Schutzstatus/Jagdzeit einspielt. Muss jeder im Team nach dem Pull einmal machen!

## Aktueller Gesamtstand
- **Backend komplett** inkl. Suche: `/genus`, `/locations`, `/animals`, `/observations`, `/observations/search`.
- **Frontend:** 4 Dialoge (Tier, Ort, Beobachtung, Suche) funktionieren end-to-end inkl. Bearbeiten/Loeschen, alles im Natur-Design.
- **Wichtig zu wissen:** Tier/Ort kann nicht geloescht werden, solange eine Beobachtung darauf verweist (DB-Fremdschluessel blockt, Backend wirft 500). Das ist gewollt, aber die Fehlermeldung im Frontend ist nur ein leerer Alert ("Fehler beim Loeschen:").

## Offene Punkte
- **`/maps-api` Backend-Endpoint** (Timo/Passi): leitet auf die Google-Maps-URL mit Key aus Env-Variable weiter. Ohne den lädt die Karte nicht. Spec:
  - `MapsController` mit `@GetMapping("/maps-api")` -> RedirectView auf `https://maps.googleapis.com/maps/api/js?key=<key>&callback=initMap`
  - `application.properties`: `google.maps.api.key=${GOOGLE_MAPS_API_KEY:}`
  - Key über Env-Variable `GOOGLE_MAPS_API_KEY` (lokal + Render).
- **Google Cloud:** Maps-JavaScript-API-Key erzeugen, per HTTP-Referrer auf `http://localhost:*/*` und die Render-URL beschränken.
- **Public Deployment über Render** geplant -> Env-Variable `GOOGLE_MAPS_API_KEY` dort eintragen.
- **Loeschen-Fehlermeldung verbessern:** Frontend (`location.js`, `animal.js`) soll bei FK-Konflikt etwas Verstaendliches anzeigen ("wird noch in einer Beobachtung verwendet"). Sauber waere zusaetzlich Backend: 409 statt 500 (Timo/Passi).
- **Tier-Dropdown in Dialog 3** zeigt nur das Geschlecht als Text -> besser "Gattung (Geschlecht)". Stelle: `fillDropdown('/animals', 'animalSelect', 'gender', 'id')` in `observation.js`.
- `docs/gattungen-setup.md` existiert noch (Gattungsliste + Datalist-Idee), ist durch Timos GenusSeeder + Sonstige-Dropdown aber teils überholt.

## Nächster sinnvoller Schritt
Sobald `/maps-api` steht, die Karte end-to-end pruefen (Ort waehlen -> Karte springt hin). Danach: Loeschen-Fehlermeldung + Tier-Dropdown-Text, dann PowerPoint fuer die Abgabe.
