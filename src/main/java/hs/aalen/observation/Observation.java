package hs.aalen.observation;

import com.fasterxml.jackson.annotation.JsonIgnore;

import hs.aalen.animal.Animal;
import hs.aalen.location.Location;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;

// eine einzelne Beobachtung: welches Tier wurde wo und wann gesehen
@Entity
public class Observation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String date;
	private String time;

	// wer hat die Sichtung erfasst (Melder)
	private String reporter;

	// Zeitpunkt, wann die Sichtung gespeichert wurde (als Text, z.B. "2026-06-13 12:50")
	private String createdAt;

	// Bild zur Sichtung als Data-URL (z.B. "data:image/jpeg;base64,...").
	// Als TEXT gespeichert. columnDefinition="text" funktioniert auf
	// HSQLDB und Postgres, kein riesiges varchar mehr.
	// @JsonIgnore: das Bild kommt nicht in jede Observation-JSON,
	// sondern nur ueber GET /observations/{id}/image.
	@Column(columnDefinition = "text")
	@JsonIgnore
	private String imageData;

	// Anzahl der "Gefaellt mir" (Likes). Fuer Likes ist kein Name noetig.
	private int likes;

	@ManyToOne
	private Animal animal;

	@ManyToOne
	private Location location;

	public Observation() {
		super();
	}

	public Observation(String date, String time, Animal animal, Location location) {
		super();
		this.date = date;
		this.time = time;
		this.animal = animal;
		this.location = location;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getTime() {
		return time;
	}
	public void setTime(String time) {
		this.time = time;
	}
	public String getReporter() {
		return reporter;
	}
	public void setReporter(String reporter) {
		this.reporter = reporter;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}

	// Bild-Rohdaten (Data-URL). Nicht im JSON, nur intern/ueber den Bild-Endpoint.
	@JsonIgnore
	public String getImageData() {
		return imageData;
	}
	public void setImageData(String imageData) {
		this.imageData = imageData;
	}

	// Praktisches Flag fuers Frontend: gibt es ueberhaupt ein Bild?
	// Landet als "hasImage" im JSON, ohne das grosse Bild mitzuschicken.
	@Transient
	public boolean getHasImage() {
		return imageData != null && !imageData.isEmpty();
	}

	public int getLikes() {
		return likes;
	}
	public void setLikes(int likes) {
		this.likes = likes;
	}

	public Animal getAnimal() {
		return animal;
	}
	public void setAnimal(Animal animal) {
		this.animal = animal;
	}
	public Location getLocation() {
		return location;
	}
	public void setLocation(Location location) {
		this.location = location;
	}

}
