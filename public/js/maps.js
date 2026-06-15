// maps.js - Karte fuer den Beobachtungs-Dialog
// Nutzt OpenStreetMap ueber die Leaflet Bibliothek (kein API Key noetig).
// Arbeitet mit dem <div id="map"> aus observation.html.
// observation.js ruft zeigeOrtAufKarte(lat, lng) auf, sobald ein Ort gewaehlt wird.

// die Karte und der Marker werden hier gemerkt, damit beide Funktionen drankommen
var karte = null;
var markierung = null;

// Startpunkt der Karte, wenn noch kein Ort gewaehlt wurde (ungefaehr Aalen)
var startLat = 48.8378;
var startLng = 10.0933;

// Karte aufbauen, sobald die Seite fertig geladen ist.
$(document).ready(function() {
    initMap();
});

// Legt die Karte einmalig im #map Container an.
function initMap() {
    // falls es auf der Seite gar keine Karte gibt, nichts tun
    if (document.getElementById('map') === null) {
        return;
    }

    karte = L.map('map').setView([startLat, startLng], 12);

    // die Kacheln von OpenStreetMap laden. Die Quellenangabe ist Pflicht.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(karte);

    // Klick auf die Karte: Marker an die geklickte Stelle setzen
    // und die Koordinaten in die Eingabefelder schreiben (falls vorhanden).
    karte.on('click', function(event) {
        var lat = event.latlng.lat;
        var lng = event.latlng.lng;
        setzeMarker(lat, lng);
        schreibeKoordinaten(lat, lng);
    });
}

// Setzt einen einzelnen Marker an die uebergebene Stelle.
// Ein eventuell vorhandener Marker wird vorher entfernt.
function setzeMarker(lat, lng) {
    // alten Marker entfernen, damit nicht mehrere stehen bleiben
    if (markierung !== null) {
        karte.removeLayer(markierung);
    }
    markierung = L.marker([lat, lng]).addTo(karte);
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
    karte.setView([parseFloat(lat), parseFloat(lng)], 15);
    setzeMarker(lat, lng);
}

// Holt die aktuelle Position ueber den Browser und setzt Karte plus Marker dorthin.
// Wird von einem Knopf "Aktueller Standort" auf der Ort-Seite (AP10) aufgerufen.
function aktuellerStandort() {
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
        karte.setView([lat, lng], 15);
        setzeMarker(lat, lng);
        schreibeKoordinaten(lat, lng);
    }, function() {
        alert('Standort konnte nicht ermittelt werden.');
    });
}
