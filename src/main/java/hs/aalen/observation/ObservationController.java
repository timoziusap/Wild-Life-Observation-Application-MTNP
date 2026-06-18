package hs.aalen.observation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

// REST-Controller fuer die Beobachtungen (Observation).
// Stellt die CRUD-Endpoints unter /observations bereit.
// Eine Beobachtung haelt welches Tier (animal) wann (date, time) wo (location) gesehen wurde.
@RestController
public class ObservationController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(ObservationController.class);

	@Autowired
	private ObservationService observationService;

	// Alle Beobachtungen zurueckgeben.
	@GetMapping("/observations")
	public List<Observation> getObservations() {
		log.info("GET /observations - alle Beobachtungen werden geladen");
		return observationService.getAllObservations();
	}

	// Die 5 neuesten Sichtungen fuer den Feed auf der Startseite.
	@GetMapping("/observations/latest")
	public List<Observation> getLatestObservations() {
		log.info("GET /observations/latest - neueste Sichtungen fuer den Feed");
		return observationService.getLatestObservations(5);
	}

	// Suche mit Filtern (Dialog 4). Alle Parameter sind optional, z.B.
	// GET /observations/search?genusId=3&gender=weiblich&minCount=2
	// Spring nimmt fuer /observations/search diesen Endpoint und nicht
	// /observations/{id}, weil der feste Pfad genauer passt.
	@GetMapping("/observations/search")
	public List<Observation> searchObservations(
			@RequestParam(required = false) Long genusId,
			@RequestParam(required = false) String gender,
			@RequestParam(required = false) Integer minCount,
			@RequestParam(required = false) Integer minYoungCount,
			@RequestParam(required = false) Long locationLnr,
			@RequestParam(required = false) Boolean protectedSpecies) {
		log.info("GET /observations/search - Suche mit Filtern wird ausgefuehrt");
		return observationService.searchObservations(genusId, gender, minCount, minYoungCount,
				locationLnr, protectedSpecies);
	}

	// Eine einzelne Beobachtung anhand der id zurueckgeben.
	@GetMapping("/observations/{id}")
	public Observation getObservation(@PathVariable Long id) {
		log.info("GET /observations/{} - einzelne Beobachtung wird geladen", id);
		return observationService.getObservation(id);
	}

	// Like fuer eine Sichtung (kein Name noetig). Gibt die neue Like-Zahl zurueck.
	@PostMapping("/observations/{id}/like")
	public ResponseEntity<Map<String, Integer>> likeObservation(@PathVariable Long id) {
		log.info("POST /observations/{}/like - Like wird gezaehlt", id);
		int likes = observationService.addLike(id);
		if (likes < 0) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(Collections.singletonMap("likes", likes));
	}

	// Neue Beobachtung anlegen. Das Frontend schickt animal und location
	// als verschachtelte Objekte mit ihrer id mit (z.B. animal: { id: 3 }).
	@PostMapping("/observations")
	public Observation addObservation(@RequestBody Observation observation) {
		log.info("POST /observations - neue Beobachtung wird angelegt (Datum {})", observation.getDate());
		return observationService.saveObservation(observation);
	}

	// Vorhandene Beobachtung aendern. Die id aus der URL wird ins Objekt gesetzt,
	// damit save() den richtigen Datensatz ueberschreibt und keinen neuen anlegt.
	@PutMapping("/observations/{id}")
	public Observation updateObservation(@PathVariable Long id, @RequestBody Observation observation) {
		log.info("PUT /observations/{} - Beobachtung wird geaendert", id);
		observation.setId(id);
		return observationService.saveObservation(observation);
	}

	// Beobachtung loeschen.
	@DeleteMapping("/observations/{id}")
	public void deleteObservation(@PathVariable Long id) {
		log.info("DELETE /observations/{} - Beobachtung wird geloescht", id);
		observationService.deleteObservation(id);
	}

}
