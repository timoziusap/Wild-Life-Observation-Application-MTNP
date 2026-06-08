// maps.js - Karte fuer den Beobachtungs-Dialog
// Nutzt Google Maps und arbeitet mit dem <div id="map"> aus observation.html.
// observation.js ruft zeigeOrtAufKarte(lat, lng) auf, sobald ein Ort gewaehlt wird.

// die Karte und der Marker werden hier gemerkt, damit beide Funktionen drankommen
var karte = null;
var markierung = null;

// Startpunkt der Karte, wenn noch kein Ort gewaehlt wurde (ungefaehr Aalen)
var startPunkt = { lat: 48.8378, lng: 10.0933 };

// Wird von Google Maps automatisch aufgerufen (callback=initMap im script-Tag).
// Legt die Karte einmalig im #map Container an.
function initMap() {
    karte = new google.maps.Map(document.getElementById('map'), {
        center: startPunkt,
        zoom: 12
    });
}

// Springt auf den uebergebenen Ort und setzt dort einen Marker.
// lat = Breitengrad, lng = Laengengrad (kommen aus der gewaehlten Location)
function zeigeOrtAufKarte(lat, lng) {
    // falls die Karte noch nicht bereit ist, nichts tun
    if (karte === null) {
        return;
    }

    var ort = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Karte auf den Ort zentrieren
    karte.setCenter(ort);
    karte.setZoom(15);

    // alten Marker entfernen, damit nicht mehrere stehen bleiben
    if (markierung !== null) {
        markierung.setMap(null);
    }

    // neuen Marker setzen
    markierung = new google.maps.Marker({
        position: ort,
        map: karte
    });
}
