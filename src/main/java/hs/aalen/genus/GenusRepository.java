package hs.aalen.genus;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

// Repository fuer Genus. CrudRepository bringt die Standard-Methoden schon mit.
public interface GenusRepository extends CrudRepository<Genus, Long> {

	// Custom-Methode per Namenskonvention: sucht Gattungen mit passender Bezeichnung.
	List<Genus> findByDesignation(String designation);

}
