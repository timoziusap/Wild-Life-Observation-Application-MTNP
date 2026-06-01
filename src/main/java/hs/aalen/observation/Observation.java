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
