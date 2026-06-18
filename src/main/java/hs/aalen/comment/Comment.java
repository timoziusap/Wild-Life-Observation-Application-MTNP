package hs.aalen.comment;

import com.fasterxml.jackson.annotation.JsonIgnore;

import hs.aalen.observation.Observation;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;

// Ein Kommentar zu einer Sichtung (Observation).
// Zum Kommentieren muss ein Name (author) angegeben werden.
@Entity
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Name der Person, die kommentiert (Pflicht).
	private String author;

	// Der Kommentartext.
	@Column(length = 2000)
	private String text;

	// Zeitpunkt des Kommentars als Text, z.B. "2026-06-18 12:50".
	private String createdAt;

	// Zu welcher Sichtung gehoert der Kommentar.
	// @JsonIgnore verhindert eine Endlosschleife beim Serialisieren
	// (Observation -> Comment -> Observation -> ...).
	@ManyToOne
	@JsonIgnore
	private Observation observation;

	public Comment() {
		super();
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getAuthor() {
		return author;
	}
	public void setAuthor(String author) {
		this.author = author;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	public Observation getObservation() {
		return observation;
	}
	public void setObservation(Observation observation) {
		this.observation = observation;
	}
}
