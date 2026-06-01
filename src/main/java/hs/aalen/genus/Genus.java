package hs.aalen.genus;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Gattung eines Tieres (z.B. Fuchs, Reh ...)
@Entity
public class Genus {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String latinDesignation;
	private String designation;

	public Genus() {
		super();
	}

	public Genus(String latinDesignation, String designation) {
		super();
		this.latinDesignation = latinDesignation;
		this.designation = designation;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getLatinDesignation() {
		return latinDesignation;
	}
	public void setLatinDesignation(String latinDesignation) {
		this.latinDesignation = latinDesignation;
	}
	public String getDesignation() {
		return designation;
	}
	public void setDesignation(String designation) {
		this.designation = designation;
	}

}
