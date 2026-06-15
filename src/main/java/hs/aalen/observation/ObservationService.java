package hs.aalen.observation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hs.aalen.animal.Animal;
import hs.aalen.animal.AnimalRepository;
import hs.aalen.location.Location;
import hs.aalen.location.LocationRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Observation. Liegt zwischen Controller und Repository.
@Service
public class ObservationService {

	@Autowired
	private ObservationRepository observationRepository;

	// Brauchen wir, um Tier und Ort anhand ihrer id richtig nachzuladen.
	@Autowired
	private AnimalRepository animalRepository;

	@Autowired
	private LocationRepository locationRepository;

	// Alle Beobachtungen holen. Wir iterieren ueber das CrudRepository und packen
	// alles in eine ArrayList (so wie bei Location und Genus).
	public List<Observation> getAllObservations() {
		List<Observation> observations = new ArrayList<>();
		for (Observation observation : observationRepository.findAll()) {
			observations.add(observation);
		}
		return observations;
	}

	// Eine Beobachtung anhand der id holen. Gibt null zurueck wenn nicht da.
	public Observation getObservation(Long id) {
		return observationRepository.findById(id).orElse(null);
	}

	// Sucht Beobachtungen anhand der uebergebenen Filter (Dialog 4).
	// Jeder Filter darf null sein, dann wird er einfach ignoriert.
	// Die Filterung passiert in einer Schleife in Java - bei unserer
	// Datenmenge reicht das voellig und bleibt gut lesbar.
	public List<Observation> searchObservations(Long genusId, String gender, Integer minCount,
			Integer minYoungCount, Long locationLnr, Boolean protectedSpecies) {
		List<Observation> ergebnis = new ArrayList<>();
		for (Observation observation : observationRepository.findAll()) {
			if (passtZurSuche(observation, genusId, gender, minCount, minYoungCount, locationLnr, protectedSpecies)) {
				ergebnis.add(observation);
			}
		}
		return ergebnis;
	}

	// Prueft eine einzelne Beobachtung gegen alle Filter.
	// Gibt false zurueck, sobald ein gesetzter Filter nicht passt.
	private boolean passtZurSuche(Observation observation, Long genusId, String gender, Integer minCount,
			Integer minYoungCount, Long locationLnr, Boolean protectedSpecies) {

		// Filter nach Sichtungsort (lNr vergleichen).
		if (locationLnr != null) {
			if (observation.getLocation() == null || !locationLnr.equals(observation.getLocation().getlNr())) {
				return false;
			}
		}

		Animal animal = observation.getAnimal();

		// Alle weiteren Filter beziehen sich auf das Tier. Hat die Beobachtung
		// kein Tier, passt sie nur, wenn auch kein Tier-Filter gesetzt ist.
		if (animal == null) {
			return genusId == null && gender == null && minCount == null
					&& minYoungCount == null && protectedSpecies == null;
		}

		// Filter nach Gattung (Tierart).
		if (genusId != null) {
			if (animal.getGenus() == null || !genusId.equals(animal.getGenus().getId())) {
				return false;
			}
		}

		// Filter nach Geschlecht.
		if (gender != null && !gender.equals(animal.getGender())) {
			return false;
		}

		// Filter nach Anzahl der Tiere (mindestens).
		if (minCount != null) {
			if (animal.getAnimalCount() == null || animal.getAnimalCount() < minCount) {
				return false;
			}
		}

		// Filter nach Anzahl der Jungtiere (mindestens).
		if (minYoungCount != null) {
			if (animal.getYoungCount() == null || animal.getYoungCount() < minYoungCount) {
				return false;
			}
		}

		// Filter nach Schutzstatus der Gattung.
		if (protectedSpecies != null) {
			if (animal.getGenus() == null || animal.getGenus().isProtectedSpecies() != protectedSpecies) {
				return false;
			}
		}

		// alle gesetzten Filter haben gepasst
		return true;
	}

	// Speichert eine Beobachtung. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	// Das Frontend schickt Tier und Ort nur als {id:...} bzw. {lNr:...}. Damit die
	// Fremdschluessel stimmen und beim Laden die Details wieder mitkommen, holen wir
	// das echte Tier und den echten Ort aus der DB und haengen sie an die Beobachtung.
	public Observation saveObservation(Observation observation) {
		// Erfassungszeitpunkt nur beim Neuanlegen setzen (noch keine id da),
		// damit ein spaeteres Bearbeiten den Zeitpunkt nicht ueberschreibt.
		if (observation.getId() == null
				&& (observation.getCreatedAt() == null || observation.getCreatedAt().isEmpty())) {
			String jetzt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
			observation.setCreatedAt(jetzt);
		}

		// Wenn kein Melder angegeben wurde, "unbekannt" eintragen.
		if (observation.getReporter() == null || observation.getReporter().isEmpty()) {
			observation.setReporter("unbekannt");
		}

		if (observation.getAnimal() != null && observation.getAnimal().getId() != null) {
			Animal animal = animalRepository.findById(observation.getAnimal().getId()).orElse(null);
			observation.setAnimal(animal);
		}
		if (observation.getLocation() != null && observation.getLocation().getlNr() != null) {
			Location location = locationRepository.findById(observation.getLocation().getlNr()).orElse(null);
			observation.setLocation(location);
		}
		return observationRepository.save(observation);
	}

	// Loescht eine Beobachtung anhand der id.
	public void deleteObservation(Long id) {
		observationRepository.deleteById(id);
	}

}
