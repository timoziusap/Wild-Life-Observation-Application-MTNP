package hs.aalen.counter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Counter. Liegt zwischen Controller und Repository.
@Service
public class CounterService {

	@Autowired
	private CounterRepository counterRepository;

	// Alle Counter holen. Wie bei Genus iterieren wir ueber das CrudRepository
	// und packen alles in eine ArrayList.
	public List<Counter> getAllCounters() {
		List<Counter> counters = new ArrayList<>();
		for (Counter c : counterRepository.findAll()) {
			counters.add(c);
		}
		return counters;
	}

	// Einen Counter anhand der id holen. Gibt null zurueck wenn nicht da.
	public Counter getCounter(Long id) {
		return counterRepository.findById(id).orElse(null);
	}

	// Speichert einen Counter. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	public Counter saveCounter(Counter counter) {
		return counterRepository.save(counter);
	}

	// Loescht einen Counter anhand der id.
	public void deleteCounter(Long id) {
		counterRepository.deleteById(id);
	}

}
