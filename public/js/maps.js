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

    // Klick auf die Karte: Marker an die geklickte Stelle setzen
    // und die Koordinaten in die Eingabefelder schreiben (falls vorhanden).
    karte.addListener('click', function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        setzeMarker(lat, lng);
        schreibeKoordinaten(lat, lng);
    });
}

// Setzt einen einzelnen Marker an die uebergebene Stelle.
// Ein eventuell vorhandener Marker wird vorher entfernt.
function setzeMarker(lat, lng) {
    var ort = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // alten Marker entfernen, damit nicht mehrere stehen bleiben
    if (markierung !== null) {
        markierung.setMap(null);
    }
    markierung = new google.maps.Marker({
        position: ort,
        map: karte
    });
}

// Schreibt die Koordinaten in die Felder Latitude und Longitude.
// Die Felder kommen aus der Ort-Seite (AP10). Gibt es sie nicht, passiert nichts.
function schreibeKoordinaten(lat, lng) {
    var latFeld = document.querySelector('[name="latitude"]');
    var lngFeld = document.querySelector('[name="longitude"]');
    if (latFeld !== null) {
        latFeld.value = lat;
    }
    if (lngFeld !== null) {
        lngFeld.value = lng;
    }
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

    setzeMarker(lat, lng);
}

// Holt die aktuelle Position ueber den Browser und setzt Karte plus Marker dorthin.
// Wird von einem Knopf "Aktueller Standort" auf der Ort-Seite (AP10) aufgerufen.
function aktuellerStandort() {
    // Karte muss bereit sein, sonst gibt es nichts zu zeigen.
    if (karte === null) {
        return;
    }
    // Manche Browser koennen die Standortabfrage nicht oder sie ist abgeschaltet.
    if (!navigator.geolocation) {
        alert('Standortabfrage wird vom Browser nicht unterstützt.');
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        karte.setCenter({ lat: lat, lng: lng });
        karte.setZoom(15);
        setzeMarker(lat, lng);
        schreibeKoordinaten(lat, lng);
    }, function() {
        alert('Standort konnte nicht ermittelt werden.');
    });
}
