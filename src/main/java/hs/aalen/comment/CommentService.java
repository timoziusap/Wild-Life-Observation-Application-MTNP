package hs.aalen.comment;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hs.aalen.observation.Observation;
import hs.aalen.observation.ObservationRepository;

// Service-Schicht fuer Kommentare. Liegt zwischen Controller und Repository.
@Service
public class CommentService {

	@Autowired
	private CommentRepository commentRepository;

	@Autowired
	private ObservationRepository observationRepository;

	// Alle Kommentare zu einer Sichtung holen (aelteste zuerst).
	public List<Comment> getCommentsForObservation(Long observationId) {
		return commentRepository.findByObservationIdOrderByIdAsc(observationId);
	}

	// Neuen Kommentar zu einer Sichtung speichern.
	// Name (author) und Text sind Pflicht. Gibt null zurueck, wenn die
	// Sichtung nicht existiert oder Pflichtangaben fehlen.
	public Comment addComment(Long observationId, Comment comment) {
		Observation observation = observationRepository.findById(observationId).orElse(null);
		if (observation == null) {
			return null;
		}
		if (comment.getAuthor() == null || comment.getAuthor().trim().isEmpty()) {
			return null;
		}
		if (comment.getText() == null || comment.getText().trim().isEmpty()) {
			return null;
		}

		comment.setId(null);
		comment.setObservation(observation);
		comment.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
		return commentRepository.save(comment);
	}
}
