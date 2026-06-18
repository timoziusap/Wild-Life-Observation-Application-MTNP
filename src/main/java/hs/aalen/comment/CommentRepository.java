package hs.aalen.comment;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

// Repository fuer Comment. CrudRepository bringt die Standard-Methoden mit.
public interface CommentRepository extends CrudRepository<Comment, Long> {

	// Alle Kommentare einer Sichtung, aelteste zuerst (per Namenskonvention).
	List<Comment> findByObservationIdOrderByIdAsc(Long observationId);

}
