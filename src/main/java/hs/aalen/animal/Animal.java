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

	// Anzahl der gesichteten Tiere (Pflichtfeld im Dialog).
	// Heisst animalCount und nicht count, weil COUNT ein
	// reserviertes Wort in SQL ist und HSQLDB sonst meckert.
	private Integer animalCount;

	// Wurden Jungtiere gesichtet? Wenn ja, steht in youngCount wie viele.
	private boolean youngPresent;
	private Integer youngCount;

	// jedes Tier gehoert zu genau einer Gattung
	@ManyToOne
	private Genus genus;

	public Animal() {
		super();
	}

	public Animal(String gender, String estimatedAge, String estimatedSize, String estimatedWeight,
			Integer animalCount, boolean youngPresent, Integer youngCount, Genus genus) {
		super();
		this.gender = gender;
		this.estimatedAge = estimatedAge;
		this.estimatedSize = estimatedSize;
		this.estimatedWeight = estimatedWeight;
		this.animalCount = animalCount;
		this.youngPresent = youngPresent;
		this.youngCount = youngCount;
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
	public Integer getAnimalCount() {
		return animalCount;
	}
	public void setAnimalCount(Integer animalCount) {
		this.animalCount = animalCount;
	}
	public boolean isYoungPresent() {
		return youngPresent;
	}
	public void setYoungPresent(boolean youngPresent) {
		this.youngPresent = youngPresent;
	}
	public Integer getYoungCount() {
		return youngCount;
	}
	public void setYoungCount(Integer youngCount) {
		this.youngCount = youngCount;
	}
	public Genus getGenus() {
		return genus;
	}
	public void setGenus(Genus genus) {
		this.genus = genus;
	}

}
