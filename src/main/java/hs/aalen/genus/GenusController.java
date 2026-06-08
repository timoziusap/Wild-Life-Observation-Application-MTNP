package hs.aalen.genus;

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

// REST-Controller fuer die Gattungen (Genus).
// Stellt die CRUD-Endpoints unter /genus bereit.
// Das Frontend (animal.js) fuellt damit das Gattungs-Dropdown (GET /genus).
@RestController
public class GenusController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(GenusController.class);

	@Autowired
	private GenusService genusService;

	// Alle Gattungen zurueckgeben.
	@GetMapping("/genus")
	public List<Genus> getGenus() {
		log.info("GET /genus - alle Gattungen werden geladen");
		return genusService.getAllGenus();
	}

	// Eine einzelne Gattung anhand der id zurueckgeben.
	@GetMapping("/genus/{id}")
	public Genus getGenus(@PathVariable Long id) {
		log.info("GET /genus/{} - einzelne Gattung wird geladen", id);
		return genusService.getGenus(id);
	}

	// Neue Gattung anlegen.
	@PostMapping("/genus")
	public Genus addGenus(@RequestBody Genus genus) {
		log.info("POST /genus - neue Gattung wird angelegt: {}", genus.getDesignation());
		return genusService.saveGenus(genus);
	}

	// Vorhandene Gattung aendern. Die id aus der URL wird ins Objekt gesetzt,
	// damit save() den richtigen Datensatz ueberschreibt und keinen neuen anlegt.
	@PutMapping("/genus/{id}")
	public Genus updateGenus(@PathVariable Long id, @RequestBody Genus genus) {
		log.info("PUT /genus/{} - Gattung wird geaendert", id);
		genus.setId(id);
		return genusService.saveGenus(genus);
	}

	// Gattung loeschen.
	@DeleteMapping("/genus/{id}")
	public void deleteGenus(@PathVariable Long id) {
		log.info("DELETE /genus/{} - Gattung wird geloescht", id);
		genusService.deleteGenus(id);
	}

}
