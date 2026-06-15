package hs.aalen.counter;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Ein Counter (Zaehlung) mit Name und aktuellem Zahlenwert.
// Wird ueber die Counter-Seite (counter.html) angelegt und hoch-/runtergezaehlt.
@Entity
public class Counter {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;

	// aktueller Zaehlerstand.
	// Heisst counterValue (nicht value), weil VALUE ein SQL-Schluesselwort ist
	// und die Tabelle sonst nicht angelegt werden kann (so wie animalCount statt count).
	private Integer counterValue;

	public Counter() {
		super();
	}

	public Counter(String name, Integer counterValue) {
		super();
		this.name = name;
		this.counterValue = counterValue;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getCounterValue() {
		return counterValue;
	}
	public void setCounterValue(Integer counterValue) {
		this.counterValue = counterValue;
	}

}
