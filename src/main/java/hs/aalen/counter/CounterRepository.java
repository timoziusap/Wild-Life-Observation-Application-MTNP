package hs.aalen.counter;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

// Repository fuer Counter. CrudRepository bringt die Standard-Methoden schon mit.
public interface CounterRepository extends CrudRepository<Counter, Long> {

	// Custom-Methode per Namenskonvention: sucht Counter mit passendem Namen.
	List<Counter> findByName(String name);

	// Alle Counter, fest nach id sortiert. Sonst kann sich die Reihenfolge nach
	// einem Speichern (z.B. Hochzaehlen) aendern und die Karten springen rum.
	List<Counter> findAllByOrderByIdAsc();

}
