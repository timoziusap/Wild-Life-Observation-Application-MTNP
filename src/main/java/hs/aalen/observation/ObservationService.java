package hs.aalen.observation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Observation. Liegt zwischen Controller und Repository.
@Service
public class ObservationService {

	@Autowired
	private ObservationRepository observationRepository;

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
	public Observation saveObservation(Observation observation) {
		return observationRepository.save(observation);
	}

	// Loescht eine Beobachtung anhand der id.
	public void deleteObservation(Long id) {
		observationRepository.deleteById(id);
	}

}
