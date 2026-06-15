// ort.js
// Tiersichtung anlegen, Schritt 2 (Ort und Abschluss).
// Zweite Seite des Sichtungs-Flows. Hier waehlt oder erstellt man den Ort und
// schliesst die Sichtung ab.
//
// Neu: Das Tier aus Schritt 1 liegt nur als Zwischenstand im sessionStorage
// (Schluessel 'tierEntwurf'). Erst beim Abschluss ("Weiter") wird zuerst das
// Tier (und ggf. eine neue Gattung) und danach die Sichtung gespeichert.
// Auch die Ort-Eingaben werden gemerkt (Schluessel 'ortEntwurf'), damit man
// zwischen Schritt 1 und Schritt 2 wechseln kann, ohne dass etwas verloren geht.


// Hier merken wir uns die geladenen Orte, damit wir beim Auswaehlen
// schnell an die Koordinaten (latitude/longitude) fuer die Karte kommen.
var alleOrte = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Ort-Dropdown aus dem Backend fuellen (GET /locations). Danach wird der
    //    Zwischenstand wiederhergestellt (die Optionen muessen erst da sein).
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

    // 7) Jede Eingabe sofort als Zwischenstand sichern.
    $('section input, section textarea, #locationSelect').on('input change', entwurfMerken);
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

            // jetzt sind die Optionen da -> Zwischenstand wiederherstellen
            entwurfWiederherstellen();
        },
        error: function(xhr, status, error) {
            console.log('Orte konnten nicht geladen werden: ' + error);
        }
    });
}


// Haengt einen Klick-Listener an die Leaflet-Karte. Die Karte (Variable
// "karte") wird in maps.js (initMap) angelegt, sobald Leaflet geladen ist.
// Da das asynchron passiert, warten wir kurz, bis die Karte bereit ist.
function aktiviereKartenKlick() {
    var versuche = 0;
    var warten = setInterval(function() {
        versuche++;

        // karte ist eine globale Variable aus maps.js
        if (typeof karte !== 'undefined' && karte !== null) {
            clearInterval(warten);
            karte.on('click', function(event) {
                // Leaflet: die Koordinaten kommen als event.latlng (Eigenschaften, keine Funktionen)
                setzeKoordinaten(event.latlng.lat, event.latlng.lng);
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
    // von Hand gesetzte Koordinaten auch im Zwischenstand merken
    entwurfMerken();
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

        // Karte auf den gespeicherten Ort schwenken und Stand merken
        ortWurdeGewaehlt();
        entwurfMerken();
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


// Knopf "Weiter": prueft Ort und Melder, holt den Tier-Zwischenstand aus
// Schritt 1 und speichert dann das Tier (ggf. mit neuer Gattung) und danach
// die komplette Sichtung.
function sichtungAbschliessen() {

    // 1) Es muss ein Ort ausgewaehlt sein.
    var gewaehlteLnr = $('#locationSelect').val();
    if (!gewaehlteLnr) {
        alert('Bitte einen Ort auswaehlen oder einen neuen Ort anlegen.');
        return;
    }

    // 1b) "Erfasst von" (Melder) ist Pflicht.
    var melder = $('#reporter').val();
    if (!melder || melder.trim() === '') {
        alert('Bitte "Erfasst von" ausfuellen - das Feld ist Pflicht.');
        return;
    }

    // 2) Tier-Zwischenstand aus Schritt 1 holen.
    var roh = sessionStorage.getItem('tierEntwurf');
    var tier = roh ? JSON.parse(roh) : null;
    if (!tier || !tier.genus || !tier.gender || !tier.animalCount) {
        alert('Bitte zuerst Schritt 1 (Tier) vollstaendig ausfuellen.');
        window.location.href = 'tier.html';
        return;
    }

    // 3) Datum und Uhrzeit automatisch setzen; alles fuer den Abschluss buendeln.
    var jetzt = new Date();
    var basis = {
        'lNr'     : gewaehlteLnr,
        'reporter': melder,
        'date'    : jetzt.getFullYear() + '-' + zweistellig(jetzt.getMonth() + 1)
                    + '-' + zweistellig(jetzt.getDate()),
        'time'    : zweistellig(jetzt.getHours()) + ':' + zweistellig(jetzt.getMinutes())
    };

    // 4) Tier-Daten aus dem Zwischenstand bauen.
    var tierDaten = {
        'gender'         : tier.gender,
        'estimatedSize'  : tier.estimatedSize,
        'estimatedWeight': tier.estimatedWeight,
        'animalCount'    : tier.animalCount,
        // echtes true/false schicken, nicht den Text aus dem Dropdown
        'youngPresent'   : tier.youngPresent === 'ja',
        'youngCount'     : 0
    };
    if (tierDaten.youngPresent) {
        tierDaten.youngCount = tier.youngCount;
    }

    // 5) Bei "Sonstige" zuerst die neue Gattung anlegen, dann Tier + Sichtung.
    if (tier.genus === 'sonstige') {

        if (!tier.sonstigeDesignation) {
            alert('Bitte eine Bezeichnung fuer die neue Gattung eingeben (Schritt 1).');
            window.location.href = 'tier.html';
            return;
        }

        var neueGattung = {
            'designation'      : tier.sonstigeDesignation,
            'latinDesignation' : tier.sonstigeLatin,
            'protectedSpecies' : tier.sonstigeProtected === 'ja',
            'huntingSeason'    : tier.sonstigeHuntingSeason
        };

        postJson('/genus', neueGattung, function(gattung) {
            tierDaten.genus = { 'id': gattung.id };
            speichereTierUndSichtung(tierDaten, basis);
        });

    } else {
        // Normale Auswahl aus der Liste: id der gewaehlten Gattung mitgeben.
        tierDaten.genus = { 'id': tier.genus };
        speichereTierUndSichtung(tierDaten, basis);
    }
}


// Speichert erst das Tier (POST /animals), dann mit dessen id die komplette
// Sichtung (POST /observations). Danach Zwischenstaende aufraeumen und zur
// Startseite.
function speichereTierUndSichtung(tierDaten, basis) {
    postJson('/animals', tierDaten, function(tierGespeichert) {

        // Tier und Ort werden als verschachtelte Objekte mit ihrer Kennung verpackt.
        // Ort-Feld heisst lNr (siehe getlNr() im Backend).
        var sichtung = {
            'animal'   : { 'id'  : tierGespeichert.id },
            'location' : { 'lNr' : basis.lNr },
            'reporter' : basis.reporter,
            'date'     : basis.date,
            'time'     : basis.time
            // createdAt setzt das Backend selbst
        };

        postJson('/observations', sichtung, function() {
            // Zwischenstaende loeschen, damit der naechste Ablauf leer beginnt.
            sessionStorage.removeItem('tierEntwurf');
            sessionStorage.removeItem('ortEntwurf');
            window.location.href = 'index.html';
        });
    });
}


// Schreibt die Ort-Felder als Zwischenstand in den sessionStorage.
function entwurfMerken() {
    var entwurf = {
        'shorttitle'    : $('#shorttitle').val(),
        'description'   : $('#description').val(),
        'latitude'      : $('#latitude').val(),
        'longitude'     : $('#longitude').val(),
        'locationSelect': $('#locationSelect').val(),
        'reporter'      : $('#reporter').val()
    };
    sessionStorage.setItem('ortEntwurf', JSON.stringify(entwurf));
}


// Holt einen gemerkten Zwischenstand und traegt ihn wieder ins Formular ein.
function entwurfWiederherstellen() {
    var roh = sessionStorage.getItem('ortEntwurf');
    if (!roh) {
        return;
    }

    var e = JSON.parse(roh);

    $('#shorttitle').val(e.shorttitle || '');
    $('#description').val(e.description || '');
    $('#latitude').val(e.latitude || '');
    $('#longitude').val(e.longitude || '');
    $('#reporter').val(e.reporter || '');

    if (e.locationSelect) {
        // ein bereits gespeicherter Ort war ausgewaehlt -> Karte dorthin
        $('#locationSelect').val(e.locationSelect);
        ortWurdeGewaehlt();
    } else if (e.latitude && e.longitude) {
        // ein neu eingegebener (noch nicht gespeicherter) Ort -> Marker setzen
        if (typeof zeigeOrtAufKarte === 'function') {
            zeigeOrtAufKarte(e.latitude, e.longitude);
        }
    }
}


// Kleiner Helfer: macht aus 5 -> "05" (fuehrende Null fuer Datum/Uhrzeit).
function zweistellig(zahl) {
    if (zahl < 10) {
        return '0' + zahl;
    }
    return '' + zahl;
}
