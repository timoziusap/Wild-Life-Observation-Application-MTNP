package hs.aalen.observation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hs.aalen.animal.Animal;
import hs.aalen.animal.AnimalRepository;
import hs.aalen.location.Location;
import hs.aalen.location.LocationRepository;

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

	// Speichert eine Beobachtung. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	// Das Frontend schickt Tier und Ort nur als {id:...} bzw. {lNr:...}. Damit die
	// Fremdschluessel stimmen und beim Laden die Details wieder mitkommen, holen wir
	// das echte Tier und den echten Ort aus der DB und haengen sie an die Beobachtung.
	public Observation saveObservation(Observation observation) {
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
