// observation.js
// Dialog 3: Beobachtung erfassen, anzeigen, bearbeiten und loeschen.
// Tier- und Ort-Dropdown fuellen. Bei Ort-Auswahl die Karte aktualisieren.


// Merkt sich die ID der Beobachtung, die gerade bearbeitet wird.
// 0 = neue Beobachtung anlegen, groesser 0 = vorhandene aendern.
var bearbeiteId = 0;

// Hier merken wir uns die geladenen Orte, damit wir beim Auswaehlen
// schnell an die Koordinaten (latitude/longitude) kommen.
var alleOrte = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Tier-Dropdown fuellen (GET /animals).
    //    Als Anzeige-Text nehmen wir das Geschlecht; falls ihr spaeter
    //    einen besseren Text wollt, hier anpassen.
    fillDropdown('/animals', 'animalSelect', 'gender', 'id');

    // 2) Ort-Dropdown fuellen. Das machen wir selbst (nicht ueber fillDropdown),
    //    weil wir die Orte zusaetzlich fuer die Karte speichern wollen.
    ladeOrte();

    // 3) Beobachtungs-Tabelle anzeigen.
    loadObservationTable();

    // 4) Formular absenden -> Beobachtung speichern.
    $("#newObservation").submit(function(event) {
        postObservation(event);
    });

    // 5) Klick auf "Laden" zeigt die Tabelle neu an.
    $('#loadObservationTable').click(function() {
        loadObservationTable();
    });

    // 6) Wenn ein Ort gewaehlt wird, die Karte aktualisieren.
    $('#locationSelect').change(function() {
        ortWurdeGewaehlt();
    });
});


// Laedt die Orte vom Backend, fuellt das Dropdown und merkt sie sich.
function ladeOrte() {
    $.ajax({
        type: 'GET',
        url: '/locations',
        success: function(data) {
            alleOrte = data;   // fuer die Karte merken
            var select = $('#locationSelect');
            $.each(data, function(index, ort) {
                var option = $('<option></option>');
                option.val(ort.lnr);          // Wert = Standortnummer
                option.text(ort.shorttitle);  // Anzeige = Kurztitel
                select.append(option);
            });
        },
        error: function(xhr, status, error) {
            console.log('Orte konnten nicht geladen werden: ' + error);
        }
    });
}


// Wird aufgerufen, wenn der Nutzer einen Ort im Dropdown waehlt.
// Sucht die Koordinaten des Ortes und gibt sie an die Karte weiter.
function ortWurdeGewaehlt() {
    var gewaehlteLnr = $('#locationSelect').val();

    // den passenden Ort in der gemerkten Liste suchen
    $.each(alleOrte, function(index, ort) {
        // == statt ===, weil der Dropdown-Wert ein Text ist und lnr eine Zahl
        if (ort.lnr == gewaehlteLnr) {

            // Karte aktualisieren. Diese Funktion schreibt MARIUS in maps.js.
            // Falls maps.js noch nicht eingebunden ist, pruefen wir das vorher,
            // damit es keinen Fehler gibt.
            if (typeof zeigeOrtAufKarte === 'function') {
                zeigeOrtAufKarte(ort.latitude, ort.longitude);
            } else {
                console.log('maps.js / zeigeOrtAufKarte() noch nicht vorhanden.');
            }
        }
    });
}


// Liest die Formularfelder aus und speichert die Beobachtung.
// bearbeiteId entscheidet ueber Anlegen (POST) oder Aendern (PUT).
function postObservation(event) {

    // Verhindert das normale Neuladen der Seite.
    event.preventDefault();

    // Werte einsammeln. Tier und Ort werden als Objekt mit id verpackt,
    // genau wie bei der Gattung im Tier-Dialog.
    var formData = {
        'date'     : $('input[name=date]').val(),
        'time'     : $('input[name=time]').val(),
        'animal'   : { 'id'  : $('#animalSelect').val() },
        'location' : { 'lNr' : $('#locationSelect').val() }
    };

    if (bearbeiteId === 0) {
        postJson('/observations', formData, nachSpeichern);
    } else {
        formData.id = bearbeiteId;
        putJson('/observations/' + bearbeiteId, formData, nachSpeichern);
    }
}


// Nach erfolgreichem Speichern: Formular leeren, Tabelle neu laden.
function nachSpeichern() {
    bearbeiteId = 0;
    $('#newObservation')[0].reset();
    $('#newObservationButton').val('Beobachtung speichern');
    loadObservationTable();
}


// Loescht eine Beobachtung nach Rueckfrage (DELETE /observations/{id}).
function loescheObservation(id) {
    if (confirm('Diese Beobachtung wirklich loeschen?')) {
        deleteJson('/observations/' + id, loadObservationTable);
    }
}


// Schreibt eine Beobachtung zurueck ins Formular zum Bearbeiten.
function bearbeiteObservation(id, animalId, locationLnr, date, time) {
    bearbeiteId = id;
    $('#animalSelect').val(animalId);
    $('#locationSelect').val(locationLnr);
    $('input[name=date]').val(date);
    $('input[name=time]').val(time);
    $('#newObservationButton').val('Aenderung speichern');
}


// Laedt alle Beobachtungen in die DataTable.
function loadObservationTable() {
    $('#observationTable').DataTable({
        destroy: true,
        "ajax": {
            "url"     : '/observations',
            "dataSrc" : "",
            "error"   : function(xhr, error, thrown) {
                console.log('Beobachtungs-Tabelle konnte nicht geladen werden: ' + thrown);
            }
        },
        "columns": [
            { "data": "id" },
            // Tier ist ein verschachteltes Objekt: Geschlecht anzeigen.
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.gender) {
                        return animal.gender;
                    }
                    return "";
                }},
            // Ort ist ein verschachteltes Objekt: Kurztitel anzeigen.
            { "data": "location", "render": function(location) {
                    if (location && location.shorttitle) {
                        return location.shorttitle;
                    }
                    return "";
                }},
            { "data": "date" },
            { "data": "time" },
            // Aktions-Buttons (Bearbeiten + Loeschen).
            { "data": null, "orderable": false, "render": function(zeile) {

                    var animalId = "";
                    if (zeile.animal && zeile.animal.id) {
                        animalId = zeile.animal.id;
                    }
                    var locationLnr = "";
                    if (zeile.location && zeile.location.lnr) {
                        locationLnr = zeile.location.lnr;
                    }

                    var bearbeitenBtn =
                        '<button onclick="bearbeiteObservation(' +
                        zeile.id + ',' +
                        '\'' + animalId + '\',' +
                        '\'' + locationLnr + '\',' +
                        '\'' + zeile.date + '\',' +
                        '\'' + zeile.time + '\'' +
                        ')">Bearbeiten</button>';

                    var loeschenBtn =
                        '<button onclick="loescheObservation(' + zeile.id + ')">Loeschen</button>';

                    return bearbeitenBtn + ' ' + loeschenBtn;
                }}
        ]
    });
}