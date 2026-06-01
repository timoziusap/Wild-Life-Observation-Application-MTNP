package hs.aalen.animal;

import hs.aalen.genus.Genus;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Animal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String gender;
	private String estimatedAge;
	private String estimatedSize;
	private String estimatedWeight;

	// jedes Tier gehoert zu genau einer Gattung
	@ManyToOne
	private Genus genus;

	public Animal() {
		super();
	}

	public Animal(String gender, String estimatedAge, String estimatedSize, String estimatedWeight, Genus genus) {
		super();
		this.gender = gender;
		this.estimatedAge = estimatedAge;
		this.estimatedSize = estimatedSize;
		this.estimatedWeight = estimatedWeight;
		this.genus = genus;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public String getEstimatedAge() {
		return estimatedAge;
	}
	public void setEstimatedAge(String estimatedAge) {
		this.estimatedAge = estimatedAge;
	}
	public String getEstimatedSize() {
		return estimatedSize;
	}
	public void setEstimatedSize(String estimatedSize) {
		this.estimatedSize = estimatedSize;
	}
	public String getEstimatedWeight() {
		return estimatedWeight;
	}
	public void setEstimatedWeight(String estimatedWeight) {
		this.estimatedWeight = estimatedWeight;
	}
	public Genus getGenus() {
		return genus;
	}
	public void setGenus(Genus genus) {
		this.genus = genus;
	}

}
