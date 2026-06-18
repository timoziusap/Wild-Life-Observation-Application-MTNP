package hs.aalen.comment;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// REST-Controller fuer die Kommentare zu einer Sichtung.
// Endpoints liegen unter /observations/{id}/comments.
@RestController
public class CommentController {

	private static final Logger log = LoggerFactory.getLogger(CommentController.class);

	@Autowired
	private CommentService commentService;

	// Alle Kommentare zu einer Sichtung zurueckgeben.
	@GetMapping("/observations/{id}/comments")
	public List<Comment> getComments(@PathVariable Long id) {
		log.info("GET /observations/{}/comments - Kommentare werden geladen", id);
		return commentService.getCommentsForObservation(id);
	}

	// Neuen Kommentar anlegen. Das Frontend schickt { author, text }.
	@PostMapping("/observations/{id}/comments")
	public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody Comment comment) {
		log.info("POST /observations/{}/comments - neuer Kommentar von {}", id,
				comment != null ? comment.getAuthor() : "null");
		Comment gespeichert = commentService.addComment(id, comment);
		if (gespeichert == null) {
			// Sichtung fehlt oder Name/Text leer.
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok(gespeichert);
	}

	// Einen Kommentar loeschen. Jeder darf das (die App hat keinen Login).
	@DeleteMapping("/comments/{commentId}")
	public void deleteComment(@PathVariable Long commentId) {
		log.info("DELETE /comments/{} - Kommentar wird geloescht", commentId);
		commentService.deleteComment(commentId);
	}
}
