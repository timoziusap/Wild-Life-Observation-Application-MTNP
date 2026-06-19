package hs.aalen.genus;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

// Einmalige Daten-Korrektur fuer bestehende Datenbanken (z.B. Live/Render):
// ersetzt ASCII-Umlaute (ae/oe/ue) in den sichtbaren Gattungsdaten durch echte
// Umlaute (ae -> ä usw.). Betrifft den Namen "Waschbaer" und den Schonzeit-Text
// von Rebhuhn.
//
// Sicher: Eine Zeile wird nur geaendert, wenn ihr aktueller Wert noch exakt dem
// alten ASCII-Wert entspricht. Dadurch laeuft die Migration nach der Umstellung
// folgenlos (idempotent), und manuell geaenderte Eintraege bleiben unberuehrt.
@Component
@Order(3)
public class GenusUmlautMigration implements CommandLineRunner {

	private final GenusRepository genusRepository;

	public GenusUmlautMigration(GenusRepository genusRepository) {
		this.genusRepository = genusRepository;
	}

	@Override
	public void run(String... args) {

		// Name: Waschbaer -> Waschbär
		for (Genus g : genusRepository.findByDesignation("Waschbaer")) {
			g.setDesignation("Waschbär");
			genusRepository.save(g);
		}

		// Schonzeit-Text von Rebhuhn: ae -> echte Umlaute
		List<Genus> rebhuhn = genusRepository.findByDesignation("Rebhuhn");
		for (Genus g : rebhuhn) {
			if ("ganzjaehrig geschont (Bestand stark gefaehrdet)".equals(g.getHuntingSeason())) {
				g.setHuntingSeason("ganzjährig geschont (Bestand stark gefährdet)");
				genusRepository.save(g);
			}
		}
	}
}
