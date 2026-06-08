package hs.aalen.observation;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

// Repository fuer Observation. CrudRepository bringt die Standard-Methoden schon mit.
public interface ObservationRepository extends CrudRepository<Observation, Long> {

	// Custom-Methode per Namenskonvention: sucht Beobachtungen an einem bestimmten Datum.
	List<Observation> findByDate(String date);

}
