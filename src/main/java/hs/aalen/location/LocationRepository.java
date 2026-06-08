package hs.aalen.location;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

// Repository fuer Location. CrudRepository bringt die Standard-Methoden schon mit.
public interface LocationRepository extends CrudRepository<Location, Long> {

	// Custom-Methode per Namenskonvention: sucht Orte mit passendem Kurztitel.
	List<Location> findByShorttitle(String shorttitle);

}
