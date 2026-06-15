package hs.aalen.counter;

import hs.aalen.genus.Genus;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

// Ein Counter (Zaehlung) fuer eine bestimmte Gattung mit aktuellem Zahlenwert.
// Wird ueber die Counter-Seite (counter.html) angelegt und hoch-/runtergezaehlt.
@Entity
public class Counter {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// frueher der freie Name der Zaehlung. Bleibt fuer alte Datensaetze erhalten,
	// neue Counter nutzen stattdessen die Gattung (genus).
	private String name;

	// Jede Zaehlung gehoert zu genau einer Gattung (ersetzt den freien Namen).
	// Wie bei Animal: @ManyToOne, im JSON kommt nur genus: { id } an.
	@ManyToOne
	private Genus genus;

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
	public Genus getGenus() {
		return genus;
	}
	public void setGenus(Genus genus) {
		this.genus = genus;
	}
	public Integer getCounterValue() {
		return counterValue;
	}
	public void setCounterValue(Integer counterValue) {
		this.counterValue = counterValue;
	}

}
