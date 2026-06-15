// ort.js
// AP10: Ablauf Tiersichtung anlegen, Schritt 2 (Ort und Abschluss).
// Zweite Seite des Sichtungs-Flows (nach dem Tier aus AP9).
// Hier waehlt oder erstellt man den Ort und schliesst die Sichtung ab.
// Die Tier-id kommt aus dem sessionStorage (AP9), Schluessel 'neueAnimalId'.


// Hier merken wir uns die geladenen Orte, damit wir beim Auswaehlen
// schnell an die Koordinaten (latitude/longitude) fuer die Karte kommen.
var alleOrte = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Ort-Dropdown aus dem Backend fuellen (GET /locations).
    ladeOrte();

    // 2) Klick auf die Karte fuellt die Koordinaten (sobald die Karte bereit ist).
    aktiviereKartenKlick();

    // 3) Knopf "Standort suchen": aktuellen Standort per Browser ermitteln.
    $('#standortSuchen').click(function() {
        standortSuchen();
    });

    // 4) Knopf "Ort speichern": neuen Ort per POST /locations anlegen.
    $('#ortSpeichern').click(function() {
        speichereNeuenOrt();
    });

    // 5) Auswahl im Dropdown -> Karte auf den gewaehlten Ort schwenken.
    $('#locationSelect').change(function() {
        ortWurdeGewaehlt();
    });

    // 6) Knopf "Weiter": Sichtung abschliessen und speichern.
    $('#weiter').click(function() {
        sichtungAbschliessen();
    });
});


// Laedt die Orte vom Backend, fuellt das Dropdown und merkt sie sich.
// WICHTIG: Das JSON-Feld heisst lNr (kleines l, grosses N), weil der
// Java-Getter getlNr() heisst. Deshalb hier ort.lNr verwenden.
function ladeOrte() {
    $.ajax({
        type: 'GET',
        url: '/locations',
        success: function(data) {
            alleOrte = data;   // fuer die Karte merken
            var select = $('#locationSelect');
            $.each(data, function(index, ort) {
                var option = $('<option></option>');
                option.val(ort.lNr);          // Wert = Standortnummer
                option.text(ort.shorttitle);  // Anzeige = Kurztitel
                select.append(option);
            });
        },
        error: function(xhr, status, error) {
            console.log('Orte konnten nicht geladen werden: ' + error);
        }
    });
}


// Haengt einen Klick-Listener an die Google-Maps-Karte. Die Karte (Variable
// "karte") wird in maps.js (initMap) angelegt, sobald Google Maps geladen ist.
// Da das asynchron passiert, warten wir kurz, bis die Karte bereit ist.
function aktiviereKartenKlick() {
    var versuche = 0;
    var warten = setInterval(function() {
        versuche++;

        // karte ist eine globale Variable aus maps.js
        if (typeof karte !== 'undefined' && karte !== null) {
            clearInterval(warten);
            karte.addListener('click', function(event) {
                setzeKoordinaten(event.latLng.lat(), event.latLng.lng());
            });
        }

        // nach ca. 10 Sekunden aufgeben (Karte evtl. nicht verfuegbar)
        if (versuche > 50) {
            clearInterval(warten);
        }
    }, 200);
}


// Schreibt die Koordinaten in die (schreibgeschuetzten) Felder und setzt
// den Marker auf der Karte (Funktion aus maps.js).
function setzeKoordinaten(lat, lng) {
    $('#latitude').val(lat);
    $('#longitude').val(lng);
    if (typeof zeigeOrtAufKarte === 'function') {
        zeigeOrtAufKarte(lat, lng);
    }
}


// Ermittelt den aktuellen Standort ueber den Browser und uebernimmt ihn.
function standortSuchen() {
    if (!navigator.geolocation) {
        alert('Standortbestimmung wird vom Browser nicht unterstuetzt. Bitte direkt auf die Karte klicken.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(position) {
            setzeKoordinaten(position.coords.latitude, position.coords.longitude);
        },
        function() {
            alert('Standort konnte nicht ermittelt werden. Bitte direkt auf die Karte klicken.');
        }
    );
}


// Legt einen neuen Ort an (POST /locations) und waehlt ihn danach
// automatisch im Dropdown aus.
function speichereNeuenOrt() {
    var bezeichnung = $('#shorttitle').val();

    // Bezeichnung ist Pflicht.
    if (!bezeichnung) {
        alert('Bitte eine Bezeichnung fuer den Ort angeben.');
        return;
    }

    // Ohne Koordinaten ergibt der Ort keinen Sinn.
    if (!$('#latitude').val() || !$('#longitude').val()) {
        alert('Bitte zuerst die Koordinaten ueber die Karte oder "Standort suchen" setzen.');
        return;
    }

    var neuerOrt = {
        'shorttitle':  bezeichnung,
        'description': $('#description').val(),
        'latitude':    $('#latitude').val(),
        'longitude':   $('#longitude').val()
    };

    postJson('/locations', neuerOrt, function(gespeichert) {
        // neuen Ort merken und ins Dropdown aufnehmen
        alleOrte.push(gespeichert);
        var option = $('<option></option>');
        option.val(gespeichert.lNr);
        option.text(gespeichert.shorttitle);
        $('#locationSelect').append(option);

        // neuen Ort direkt auswaehlen
        $('#locationSelect').val(gespeichert.lNr);

        // Eingabefelder fuer den neuen Ort wieder leeren
        $('#shorttitle').val('');
        $('#description').val('');

        // Karte auf den gespeicherten Ort schwenken
        ortWurdeGewaehlt();
    });
}


// Wird aufgerufen, wenn der Nutzer einen Ort im Dropdown waehlt.
// Sucht die Koordinaten des Ortes und gibt sie an die Karte weiter.
function ortWurdeGewaehlt() {
    var gewaehlteLnr = $('#locationSelect').val();

    $.each(alleOrte, function(index, ort) {
        // == statt ===, weil der Dropdown-Wert ein Text ist und lNr eine Zahl
        if (ort.lNr == gewaehlteLnr) {
            if (typeof zeigeOrtAufKarte === 'function') {
                zeigeOrtAufKarte(ort.latitude, ort.longitude);
            }
        }
    });
}


// Knopf "Weiter": prueft den Ort, holt die Tier-id aus AP9 und speichert
// die komplette Sichtung (POST /observations). Danach zurueck zur Startseite.
function sichtungAbschliessen() {

    // 1) Es muss ein Ort ausgewaehlt sein.
    var gewaehlteLnr = $('#locationSelect').val();
    if (!gewaehlteLnr) {
        alert('Bitte einen Ort auswaehlen oder einen neuen Ort anlegen.');
        return;
    }

    // 2) Tier-id aus sessionStorage holen (kommt aus AP9).
    var animalId = sessionStorage.getItem('neueAnimalId');
    if (!animalId) {
        alert('Kein Tier gefunden. Bitte zuerst Schritt 1 (Tier) ausfuellen.');
        return;
    }

    // 3) Datum und Uhrzeit automatisch setzen.
    var jetzt = new Date();
    var datum = jetzt.getFullYear() + '-' + zweistellig(jetzt.getMonth() + 1)
              + '-' + zweistellig(jetzt.getDate());
    var uhrzeit = zweistellig(jetzt.getHours()) + ':' + zweistellig(jetzt.getMinutes());

    // Tier und Ort werden als verschachtelte Objekte mit ihrer Kennung verpackt.
    // Ort-Feld heisst lNr (siehe getlNr() im Backend).
    var sichtung = {
        'animal'   : { 'id'  : animalId },
        'location' : { 'lNr' : gewaehlteLnr },
        'reporter' : $('#reporter').val(),
        'date'     : datum,
        'time'     : uhrzeit
        // createdAt setzt das Backend selbst (AP7)
    };

    // 4) Speichern. Nach Erfolg sessionStorage aufraeumen und zur Startseite.
    postJson('/observations', sichtung, function() {
        sessionStorage.removeItem('neueAnimalId');
        window.location.href = 'index.html';
    });
}


// Kleiner Helfer: macht aus 5 -> "05" (fuehrende Null fuer Datum/Uhrzeit).
function zweistellig(zahl) {
    if (zahl < 10) {
        return '0' + zahl;
    }
    return '' + zahl;
}
