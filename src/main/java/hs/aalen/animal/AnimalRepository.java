package hs.aalen.animal;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

// Repository fuer Animal. CrudRepository bringt die Standard-Methoden schon mit.
public interface AnimalRepository extends CrudRepository<Animal, Long> {

	// Custom-Methode per Namenskonvention: sucht Tiere mit passendem Geschlecht.
	List<Animal> findByGender(String gender);

}
