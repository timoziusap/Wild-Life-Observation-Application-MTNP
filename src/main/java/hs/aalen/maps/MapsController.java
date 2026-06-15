package hs.aalen.maps;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

// Liefert das Google Maps Script, damit der API Key nicht im Frontend steht.
// Das Frontend laedt <script async defer src="/maps-api">.
// Wir leiten von hier auf die echte Google URL weiter, inklusive callback=initMap.
@RestController
public class MapsController {

	// Logger fuers Nachvollziehen was passiert.
	private static final Logger log = LoggerFactory.getLogger(MapsController.class);

	// Der Key kommt aus application.properties (google.maps.key), nicht aus dem Code.
	// Steht dort nur ein Platzhalter, bleibt der Wert leer.
	@Value("${google.maps.key:}")
	private String mapsKey;

	// GET /maps-api leitet auf die Google Maps JavaScript API weiter.
	@GetMapping("/maps-api")
	public ResponseEntity<Void> getMapsApi() {
		log.info("GET /maps-api - Google Maps Script wird geladen");

		// callback=initMap sorgt dafuer, dass Google die Funktion initMap aus maps.js aufruft.
		String googleUrl = "https://maps.googleapis.com/maps/api/js?key="
				+ mapsKey + "&callback=initMap";

		// Weiterleitung (302) auf die echte Google URL.
		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(URI.create(googleUrl));
		return new ResponseEntity<>(headers, HttpStatus.FOUND);
	}
}
