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

	// Ist die Tierart geschuetzt? Geschuetzte Arten duerfen nicht bejagt werden.
	// Heisst protectedSpecies, weil "protected" ein Java-Schluesselwort ist.
	private boolean protectedSpecies;

	// Jagdzeitraum bzw. Schutzbestimmung als Freitext,
	// z.B. "01.05. - 31.01." oder "ganzjaehrig geschont"
	private String huntingSeason;

	public Genus() {
		super();
	}

	public Genus(String latinDesignation, String designation, boolean protectedSpecies, String huntingSeason) {
		super();
		this.latinDesignation = latinDesignation;
		this.designation = designation;
		this.protectedSpecies = protectedSpecies;
		this.huntingSeason = huntingSeason;
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
	public boolean isProtectedSpecies() {
		return protectedSpecies;
	}
	public void setProtectedSpecies(boolean protectedSpecies) {
		this.protectedSpecies = protectedSpecies;
	}
	public String getHuntingSeason() {
		return huntingSeason;
	}
	public void setHuntingSeason(String huntingSeason) {
		this.huntingSeason = huntingSeason;
	}

}
