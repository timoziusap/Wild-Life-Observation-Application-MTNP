package hs.aalen.counter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// REST-Controller fuer die Counter (Zaehlungen).
// Stellt die CRUD-Endpoints unter /counters bereit.
// Das Frontend (counter.js) laedt die Counter und speichert Aenderungen darueber.
@RestController
public class CounterController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(CounterController.class);

	@Autowired
	private CounterService counterService;

	// Alle Counter zurueckgeben.
	@GetMapping("/counters")
	public List<Counter> getCounters() {
		log.info("GET /counters - alle Counter werden geladen");
		return counterService.getAllCounters();
	}

	// Einen einzelnen Counter anhand der id zurueckgeben.
	@GetMapping("/counters/{id}")
	public Counter getCounter(@PathVariable Long id) {
		log.info("GET /counters/{} - einzelner Counter wird geladen", id);
		return counterService.getCounter(id);
	}

	// Neuen Counter anlegen.
	@PostMapping("/counters")
	public Counter addCounter(@RequestBody Counter counter) {
		log.info("POST /counters - neuer Counter wird angelegt: {}", counter.getName());
		return counterService.saveCounter(counter);
	}

	// Vorhandenen Counter aendern (z.B. neuer Zaehlerstand). Die id aus der URL
	// wird ins Objekt gesetzt, damit save() den richtigen Datensatz ueberschreibt
	// und keinen neuen anlegt.
	@PutMapping("/counters/{id}")
	public Counter updateCounter(@PathVariable Long id, @RequestBody Counter counter) {
		log.info("PUT /counters/{} - Counter wird geaendert", id);
		counter.setId(id);
		return counterService.saveCounter(counter);
	}

	// Counter loeschen.
	@DeleteMapping("/counters/{id}")
	public void deleteCounter(@PathVariable Long id) {
		log.info("DELETE /counters/{} - Counter wird geloescht", id);
		counterService.deleteCounter(id);
	}

}
