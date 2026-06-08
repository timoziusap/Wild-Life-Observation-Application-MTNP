package hs.aalen.location;

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

// REST-Controller fuer die Beobachtungsorte (Location).
// Stellt die CRUD-Endpoints unter /locations bereit.
@RestController
public class LocationController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(LocationController.class);

	@Autowired
	private LocationService locationService;

	// Alle Orte zurueckgeben.
	@GetMapping("/locations")
	public List<Location> getLocations() {
		log.info("GET /locations - alle Orte werden geladen");
		return locationService.getAllLocations();
	}

	// Einen einzelnen Ort anhand der Nummer (lNr) zurueckgeben.
	@GetMapping("/locations/{lNr}")
	public Location getLocation(@PathVariable Long lNr) {
		log.info("GET /locations/{} - einzelner Ort wird geladen", lNr);
		return locationService.getLocation(lNr);
	}

	// Neuen Ort anlegen.
	@PostMapping("/locations")
	public Location addLocation(@RequestBody Location location) {
		log.info("POST /locations - neuer Ort wird angelegt: {}", location.getShorttitle());
		return locationService.saveLocation(location);
	}

	// Vorhandenen Ort aendern. Die lNr aus der URL wird ins Objekt gesetzt,
	// damit save() den richtigen Datensatz ueberschreibt und keinen neuen anlegt.
	@PutMapping("/locations/{lNr}")
	public Location updateLocation(@PathVariable Long lNr, @RequestBody Location location) {
		log.info("PUT /locations/{} - Ort wird geaendert", lNr);
		location.setlNr(lNr);
		return locationService.saveLocation(location);
	}

	// Ort loeschen.
	@DeleteMapping("/locations/{lNr}")
	public void deleteLocation(@PathVariable Long lNr) {
		log.info("DELETE /locations/{} - Ort wird geloescht", lNr);
		locationService.deleteLocation(lNr);
	}

}
