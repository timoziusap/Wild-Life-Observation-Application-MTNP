package hs.aalen.animal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hs.aalen.genus.Genus;
import hs.aalen.genus.GenusRepository;

import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Animal. Liegt zwischen Controller und Repository.
@Service
public class AnimalService {

	@Autowired
	private AnimalRepository animalRepository;

	// Brauchen wir, um die Gattung anhand der id richtig nachzuladen.
	@Autowired
	private GenusRepository genusRepository;

	// Alle Tiere holen. Wir iterieren ueber das CrudRepository und packen
	// alles in eine ArrayList (so wie bei Location).
	public List<Animal> getAllAnimals() {
		List<Animal> animals = new ArrayList<>();
		for (Animal animal : animalRepository.findAll()) {
			animals.add(animal);
		}
		return animals;
	}

	// Ein Tier anhand der id holen. Gibt null zurueck wenn nicht da.
	public Animal getAnimal(Long id) {
		return animalRepository.findById(id).orElse(null);
	}

	// Speichert ein Tier. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	// Das Frontend schickt die Gattung nur als {id:...}. Damit der Fremdschluessel
	// stimmt und spaeter die Bezeichnung wieder mitkommt, laden wir die echte
	// Gattung aus der DB nach und haengen sie ans Tier.
	public Animal saveAnimal(Animal animal) {
		if (animal.getGenus() != null && animal.getGenus().getId() != null) {
			Genus genus = genusRepository.findById(animal.getGenus().getId()).orElse(null);
			animal.setGenus(genus);
		}
		return animalRepository.save(animal);
	}

	// Loescht ein Tier anhand der id.
	public void deleteAnimal(Long id) {
		animalRepository.deleteById(id);
	}

}
