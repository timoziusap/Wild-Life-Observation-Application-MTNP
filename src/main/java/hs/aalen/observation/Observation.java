package hs.aalen.observation;

import hs.aalen.animal.Animal;
import hs.aalen.location.Location;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

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
