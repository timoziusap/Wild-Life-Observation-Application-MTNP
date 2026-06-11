package hs.aalen.genus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Schreibt beim Start eine Liste mit gaengigen jagdbaren Wildarten in die DB.
// Wird nur ausgefuehrt wenn noch keine Gattung vorhanden ist, damit beim
// naechsten Start keine Dubletten entstehen.
// Die Jagdzeiten sind Beispielwerte nach Bundesjagdgesetz - je nach
// Bundesland koennen sie abweichen, fuer die App reicht das aber.
@Component
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

		// latinDesignation, designation, protectedSpecies, huntingSeason
		genusRepository.save(new Genus("Capreolus capreolus", "Rehwild", false, "01.05. - 31.01."));
		genusRepository.save(new Genus("Cervus elaphus", "Rotwild", false, "01.08. - 31.01."));
		genusRepository.save(new Genus("Dama dama", "Damwild", false, "01.09. - 31.01."));
		genusRepository.save(new Genus("Sus scrofa", "Schwarzwild (Wildschwein)", false, "ganzjaehrig (Bachen mit Frischlingen geschont)"));
		genusRepository.save(new Genus("Vulpes vulpes", "Rotfuchs", false, "ganzjaehrig (Elterntiere waehrend Aufzucht geschont)"));
		genusRepository.save(new Genus("Lepus europaeus", "Feldhase", false, "01.10. - 15.01."));
		genusRepository.save(new Genus("Oryctolagus cuniculus", "Wildkaninchen", false, "ganzjaehrig"));
		genusRepository.save(new Genus("Meles meles", "Dachs", false, "01.08. - 31.10."));
		genusRepository.save(new Genus("Martes foina", "Steinmarder", false, "16.10. - 28.02."));
		genusRepository.save(new Genus("Martes martes", "Baummarder", false, "16.10. - 28.02."));
		genusRepository.save(new Genus("Mustela putorius", "Iltis", false, "01.08. - 28.02."));
		genusRepository.save(new Genus("Procyon lotor", "Waschbaer", false, "ganzjaehrig"));
		genusRepository.save(new Genus("Nyctereutes procyonoides", "Marderhund", false, "ganzjaehrig"));
		genusRepository.save(new Genus("Anas platyrhynchos", "Stockente", false, "01.09. - 15.01."));
		genusRepository.save(new Genus("Anser anser", "Graugans", false, "01.08. - 15.01."));
		genusRepository.save(new Genus("Columba palumbus", "Ringeltaube", false, "01.11. - 20.02."));
		genusRepository.save(new Genus("Phasianus colchicus", "Fasan", false, "01.10. - 15.01."));
		genusRepository.save(new Genus("Perdix perdix", "Rebhuhn", true, "ganzjaehrig geschont (Bestand stark gefaehrdet)"));
		genusRepository.save(new Genus("Scolopax rusticola", "Waldschnepfe", false, "16.10. - 15.01."));
		genusRepository.save(new Genus("Ondatra zibethicus", "Bisamratte", false, "ganzjaehrig"));
	}

}
