package hs.aalen.genus;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

// Einmalige Daten-Korrektur fuer bestehende Datenbanken (z.B. Live/Render):
// stellt die gespeicherten Werte von JAGDZEIT auf SCHONZEIT um, passend zur
// neuen Logik "im Zeitraum = geschuetzt".
//
// Sicher: Es wird nur eine Zeile geaendert, wenn ihr aktueller Wert noch
// exakt dem alten Jagdzeit-Wert entspricht. Dadurch werden manuell geaenderte
// Eintraege NICHT ueberschrieben, und nach der Umstellung laeuft die Migration
// folgenlos (idempotent), weil der alte Wert nicht mehr vorkommt.
@Component
@Order(2)
public class GenusSchonzeitMigration implements CommandLineRunner {

	private final GenusRepository genusRepository;

	public GenusSchonzeitMigration(GenusRepository genusRepository) {
		this.genusRepository = genusRepository;
	}

	// designation, alterWert (Jagdzeit), neuerWert (Schonzeit)
	private static final String[][] KORREKTUR = {
		{"Rehwild",                   "01.05. - 31.01.", "01.02. - 30.04."},
		{"Rotwild",                   "01.08. - 31.01.", "01.02. - 31.07."},
		{"Damwild",                   "01.09. - 31.01.", "01.02. - 31.08."},
		{"Schwarzwild (Wildschwein)", "ganzjaehrig (Bachen mit Frischlingen geschont)", "keine"},
		{"Rotfuchs",                  "ganzjaehrig (Elterntiere waehrend Aufzucht geschont)", "keine"},
		{"Feldhase",                  "01.10. - 15.01.", "16.01. - 30.09."},
		{"Wildkaninchen",             "ganzjaehrig",     "keine"},
		{"Dachs",                     "01.08. - 31.10.", "01.11. - 31.07."},
		{"Steinmarder",               "16.10. - 28.02.", "01.03. - 15.10."},
		{"Baummarder",                "16.10. - 28.02.", "01.03. - 15.10."},
		{"Iltis",                     "01.08. - 28.02.", "01.03. - 31.07."},
		{"Waschbaer",                 "ganzjaehrig",     "keine"},
		{"Marderhund",                "ganzjaehrig",     "keine"},
		{"Stockente",                 "01.09. - 15.01.", "16.01. - 31.08."},
		{"Graugans",                  "01.08. - 15.01.", "16.01. - 31.07."},
		{"Ringeltaube",               "01.11. - 20.02.", "21.02. - 31.10."},
		{"Fasan",                     "01.10. - 15.01.", "16.01. - 30.09."},
		{"Waldschnepfe",              "16.10. - 15.01.", "16.01. - 15.10."},
		{"Bisamratte",                "ganzjaehrig",     "keine"}
	};

	@Override
	public void run(String... args) {
		for (String[] eintrag : KORREKTUR) {
			List<Genus> treffer = genusRepository.findByDesignation(eintrag[0]);
			for (Genus g : treffer) {
				if (eintrag[1].equals(g.getHuntingSeason())) {
					g.setHuntingSeason(eintrag[2]);
					genusRepository.save(g);
				}
			}
		}
	}
}
