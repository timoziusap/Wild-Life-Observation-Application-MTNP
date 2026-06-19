package hs.aalen.genus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

// Schreibt beim Start eine Liste gaengiger Wildarten in die DB (nur wenn noch
// keine Gattung vorhanden ist, damit keine Dubletten entstehen).
//
// WICHTIG: huntingSeason enthaelt jetzt die SCHONZEIT (geschuetzte Zeit),
// passend zur Logik "im Zeitraum = geschuetzt". Die Schonzeit ist der
// Gegenzeitraum zur jagdlichen Jagdzeit. Ganzjaehrig bejagbare Arten haben
// keine Schonzeit ("keine").
@Component
@Order(1)
public class GenusSeeder implements CommandLineRunner {

	private final GenusRepository genusRepository;

	public GenusSeeder(GenusRepository genusRepository) {
		this.genusRepository = genusRepository;
	}

	@Override
	public void run(String... args) {

		// Wenn schon Gattungen da sind, nichts tun.
		if (genusRepository.count() > 0) {
			return;
		}

		// latinDesignation, designation, protectedSpecies, huntingSeason (= Schonzeit)
		genusRepository.save(new Genus("Capreolus capreolus", "Rehwild", false, "01.02. - 30.04."));
		genusRepository.save(new Genus("Cervus elaphus", "Rotwild", false, "01.02. - 31.07."));
		genusRepository.save(new Genus("Dama dama", "Damwild", false, "01.02. - 31.08."));
		genusRepository.save(new Genus("Sus scrofa", "Schwarzwild (Wildschwein)", false, "keine"));
		genusRepository.save(new Genus("Vulpes vulpes", "Rotfuchs", false, "keine"));
		genusRepository.save(new Genus("Lepus europaeus", "Feldhase", false, "16.01. - 30.09."));
		genusRepository.save(new Genus("Oryctolagus cuniculus", "Wildkaninchen", false, "keine"));
		genusRepository.save(new Genus("Meles meles", "Dachs", false, "01.11. - 31.07."));
		genusRepository.save(new Genus("Martes foina", "Steinmarder", false, "01.03. - 15.10."));
		genusRepository.save(new Genus("Martes martes", "Baummarder", false, "01.03. - 15.10."));
		genusRepository.save(new Genus("Mustela putorius", "Iltis", false, "01.03. - 31.07."));
		genusRepository.save(new Genus("Procyon lotor", "Waschbär", false, "keine"));
		genusRepository.save(new Genus("Nyctereutes procyonoides", "Marderhund", false, "keine"));
		genusRepository.save(new Genus("Anas platyrhynchos", "Stockente", false, "16.01. - 31.08."));
		genusRepository.save(new Genus("Anser anser", "Graugans", false, "16.01. - 31.07."));
		genusRepository.save(new Genus("Columba palumbus", "Ringeltaube", false, "21.02. - 31.10."));
		genusRepository.save(new Genus("Phasianus colchicus", "Fasan", false, "16.01. - 30.09."));
		genusRepository.save(new Genus("Perdix perdix", "Rebhuhn", true, "ganzjährig geschont (Bestand stark gefährdet)"));
		genusRepository.save(new Genus("Scolopax rusticola", "Waldschnepfe", false, "16.01. - 15.10."));
		genusRepository.save(new Genus("Ondatra zibethicus", "Bisamratte", false, "keine"));
	}

}
