package hs.aalen.animal;

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

// REST-Controller fuer die Tiere (Animal).
// Stellt die CRUD-Endpoints unter /animals bereit (passt zu animal.js).
@RestController
public class AnimalController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(AnimalController.class);

	@Autowired
	private AnimalService animalService;

	// Alle Tiere zurueckgeben.
	@GetMapping("/animals")
	public List<Animal> getAnimals() {
		log.info("GET /animals - alle Tiere werden geladen");
		return animalService.getAllAnimals();
	}

	// Ein einzelnes Tier anhand der id zurueckgeben.
	@GetMapping("/animals/{id}")
	public Animal getAnimal(@PathVariable Long id) {
		log.info("GET /animals/{} - einzelnes Tier wird geladen", id);
		return animalService.getAnimal(id);
	}

	// Neues Tier anlegen.
	@PostMapping("/animals")
	public Animal addAnimal(@RequestBody Animal animal) {
		log.info("POST /animals - neues Tier wird angelegt");
		return animalService.saveAnimal(animal);
	}

	// Vorhandenes Tier aendern. Die id aus der URL wird ins Objekt gesetzt,
	// damit save() den richtigen Datensatz ueberschreibt und keinen neuen anlegt.
	@PutMapping("/animals/{id}")
	public Animal updateAnimal(@PathVariable Long id, @RequestBody Animal animal) {
		log.info("PUT /animals/{} - Tier wird geaendert", id);
		animal.setId(id);
		return animalService.saveAnimal(animal);
	}

	// Tier loeschen.
	@DeleteMapping("/animals/{id}")
	public void deleteAnimal(@PathVariable Long id) {
		log.info("DELETE /animals/{} - Tier wird geloescht", id);
		animalService.deleteAnimal(id);
	}

}
