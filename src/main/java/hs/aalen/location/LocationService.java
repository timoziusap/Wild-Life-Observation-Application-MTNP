package hs.aalen.location;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// Service-Schicht fuer Location. Liegt zwischen Controller und Repository.
@Service
public class LocationService {

	@Autowired
	private LocationRepository locationRepository;

	// Alle Orte holen. Wir iterieren ueber das CrudRepository und packen
	// alles in eine ArrayList (so wie im VideoArchive).
	public List<Location> getAllLocations() {
		List<Location> locations = new ArrayList<>();
		for (Location location : locationRepository.findAll()) {
			locations.add(location);
		}
		return locations;
	}

	// Einen Ort anhand der Nummer (lNr) holen. Gibt null zurueck wenn nicht da.
	public Location getLocation(Long lNr) {
		return locationRepository.findById(lNr).orElse(null);
	}

	// Speichert einen Ort. Wird sowohl zum Anlegen als auch zum Aendern benutzt.
	public Location saveLocation(Location location) {
		return locationRepository.save(location);
	}

	// Loescht einen Ort anhand der Nummer.
	public void deleteLocation(Long lNr) {
		locationRepository.deleteById(lNr);
	}

}
