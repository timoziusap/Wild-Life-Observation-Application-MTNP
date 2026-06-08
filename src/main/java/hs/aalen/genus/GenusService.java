package hs.aalen.genus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Genus. Liegt zwischen Controller und Repository.
@Service
public class GenusService {

	@Autowired
	private GenusRepository genusRepository;

	// Alle Gattungen holen. Wir iterieren ueber das CrudRepository und packen
	// alles in eine ArrayList (so wie bei Location).
	public List<Genus> getAllGenus() {
		List<Genus> genus = new ArrayList<>();
		for (Genus g : genusRepository.findAll()) {
			genus.add(g);
		}
		return genus;
	}

	// Eine Gattung anhand der id holen. Gibt null zurueck wenn nicht da.
	public Genus getGenus(Long id) {
		return genusRepository.findById(id).orElse(null);
	}

	// Speichert eine Gattung. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	public Genus saveGenus(Genus genus) {
		return genusRepository.save(genus);
	}

	// Loescht eine Gattung anhand der id.
	public void deleteGenus(Long id) {
		genusRepository.deleteById(id);
	}

}
