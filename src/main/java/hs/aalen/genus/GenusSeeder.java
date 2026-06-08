package hs.aalen.genus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Schreibt beim Start eine Liste mit gaengigen jagdbaren Wildarten in die DB.
// Wird nur ausgefuehrt wenn noch keine Gattung vorhanden ist, damit beim
// naechsten Start keine Dubletten entstehen.
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

		// latinDesignation, designation
		genusRepository.save(new Genus("Capreolus capreolus", "Rehwild"));
		genusRepository.save(new Genus("Cervus elaphus", "Rotwild"));
		genusRepository.save(new Genus("Dama dama", "Damwild"));
		genusRepository.save(new Genus("Sus scrofa", "Schwarzwild (Wildschwein)"));
		genusRepository.save(new Genus("Vulpes vulpes", "Rotfuchs"));
		genusRepository.save(new Genus("Lepus europaeus", "Feldhase"));
		genusRepository.save(new Genus("Oryctolagus cuniculus", "Wildkaninchen"));
		genusRepository.save(new Genus("Meles meles", "Dachs"));
		genusRepository.save(new Genus("Martes foina", "Steinmarder"));
		genusRepository.save(new Genus("Martes martes", "Baummarder"));
		genusRepository.save(new Genus("Mustela putorius", "Iltis"));
		genusRepository.save(new Genus("Procyon lotor", "Waschbaer"));
		genusRepository.save(new Genus("Nyctereutes procyonoides", "Marderhund"));
		genusRepository.save(new Genus("Anas platyrhynchos", "Stockente"));
		genusRepository.save(new Genus("Anser anser", "Graugans"));
		genusRepository.save(new Genus("Columba palumbus", "Ringeltaube"));
		genusRepository.save(new Genus("Phasianus colchicus", "Fasan"));
		genusRepository.save(new Genus("Perdix perdix", "Rebhuhn"));
		genusRepository.save(new Genus("Scolopax rusticola", "Waldschnepfe"));
		genusRepository.save(new Genus("Ondatra zibethicus", "Bisamratte"));
	}

}
