// tier.js
// Tiersichtung anlegen, Schritt 1: das Tier erfassen.
// Das Tier wird hier NOCH NICHT gespeichert. Die Eingaben werden nur als
// Zwischenstand im sessionStorage gemerkt (Schluessel 'tierEntwurf'), damit man
// zwischen Schritt 1 und Schritt 2 hin- und herwechseln kann, ohne dass etwas
// verloren geht. Erst beim Abschluss in Schritt 2 (ort.js) wird gespeichert.

// Hier merken wir uns die geladenen Gattungen, damit wir beim Auswaehlen
// schnell an Schutzstatus und Jagdzeit kommen (fuer die Info-Box).
var alleGattungen = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus). Danach wird in
    //    der Erfolgs-Funktion der Zwischenstand wiederhergestellt (die Optionen
    //    muessen erst da sein, bevor man eine auswaehlen kann).
    ladeGattungen();

    // 2) Wenn das Formular abgeschickt wird, weiter zu Schritt 2 (Ort).
    $("#newTier").submit(function(event) {
        weiter(event);
    });

    // 3) Wenn im Dropdown "Sonstige" gewaehlt wird, die Felder fuer die
    //    neue Gattung einblenden. Sonst die Info-Box zur Gattung anzeigen.
    $('#genusSelect').change(function() {
        if ($('#genusSelect').val() === 'sonstige') {
            $('#sonstigeGenusBereich').show();
            $('#genusInfo').hide();
        } else {
            $('#sonstigeGenusBereich').hide();
            zeigeGattungsInfo();
        }
    });

    // 4) Jungtiere-Dropdown: bei "ja" das Feld fuer die Anzahl einblenden.
    $('#youngSelect').change(function() {
        if ($('#youngSelect').val() === 'ja') {
            $('#youngCountBereich').show();
        } else {
            $('#youngCountBereich').hide();
        }
    });

    // 5) Jede Eingabe sofort als Zwischenstand sichern, damit beim Wechsel zu
    //    Schritt 2 (und wieder zurueck) nichts verloren geht.
    $('#newTier').on('input change', entwurfMerken);
});


// Laedt die Gattungen vom Backend, fuellt das Dropdown und merkt sie sich.
function ladeGattungen() {
    $.ajax({
        type: 'GET',
        url: '/genus',
        success: function(data) {
            alleGattungen = data;   // fuer die Info-Box merken
            var select = $('#genusSelect');
            $.each(data, function(index, gattung) {
                var option = $('<option></option>');
                option.val(gattung.id);
                option.text(gattung.designation);
                select.append(option);
            });

            // jetzt sind die Optionen da -> Zwischenstand wiederherstellen
            entwurfWiederherstellen();
        },
        error: function(xhr, status, error) {
            console.log('Gattungen konnten nicht geladen werden: ' + error);
        }
    });
}


// Zeigt Schutzstatus und Jagdzeit der gewaehlten Gattung unter dem Dropdown an.
function zeigeGattungsInfo() {
    var gewaehlteId = $('#genusSelect').val();
    $('#genusInfo').hide();

    // die passende Gattung in der gemerkten Liste suchen
    $.each(alleGattungen, function(index, gattung) {
        // == statt ===, weil der Dropdown-Wert ein Text ist und id eine Zahl
        if (gattung.id == gewaehlteId) {

            // Status wird aus dem Zeitraum abgeleitet (im Zeitraum = geschuetzt).
            var hinweis = '';
            if (typeof schonzeitHinweis === 'function') {
                var heute = new Date();
                var heuteStr = heute.getFullYear() + '-'
                    + ('0' + (heute.getMonth() + 1)).slice(-2) + '-'
                    + ('0' + heute.getDate()).slice(-2);
                hinweis = schonzeitHinweis(gattung, heuteStr);
            }

            var text = hinweis ? hinweis : 'Aktuell jagdbar.';
            if (gattung.huntingSeason) {
                text = text + ' Schonzeit: ' + gattung.huntingSeason;
            }

            $('#genusInfo').text(text).show();
        }
    });
}


// "Weiter": Tier NICHT speichern, nur den Zwischenstand sichern und zu Schritt 2.
// Da dies der submit-Handler ist, prueft der Browser vorher die Pflichtfelder
// (Gattung, Geschlecht, Anzahl).
function weiter(event) {
    event.preventDefault();

    // Bei "Sonstige" muss wenigstens eine Bezeichnung dastehen.
    if ($('#genusSelect').val() === 'sonstige' && !$('#sonstigeDesignation').val()) {
        alert('Bitte eine Bezeichnung für die neue Gattung eingeben.');
        return;
    }

    // aktuellen Stand sichern und weiter zur Ort-Seite
    entwurfMerken();
    window.location.href = 'ort.html';
}


// Schreibt alle Formularfelder als Zwischenstand in den sessionStorage.
function entwurfMerken() {
    var entwurf = {
        'genus'                : $('#genusSelect').val(),
        'sonstigeDesignation'  : $('#sonstigeDesignation').val(),
        'sonstigeLatin'        : $('#sonstigeLatin').val(),
        'sonstigeProtected'    : $('#sonstigeProtected').val(),
        'sonstigeHuntingSeason': $('#sonstigeHuntingSeason').val(),
        'gender'               : $('select[name=gender]').val(),
        'animalCount'          : $('input[name=animalCount]').val(),
        'estimatedSize'        : $('input[name=estimatedSize]').val(),
        'estimatedWeight'      : $('input[name=estimatedWeight]').val(),
        'youngPresent'         : $('#youngSelect').val(),
        'youngCount'           : $('input[name=youngCount]').val()
    };
    sessionStorage.setItem('tierEntwurf', JSON.stringify(entwurf));
}


// Holt einen gemerkten Zwischenstand und traegt ihn wieder ins Formular ein.
function entwurfWiederherstellen() {
    var roh = sessionStorage.getItem('tierEntwurf');
    if (!roh) {
        return;
    }

    var e = JSON.parse(roh);

    if (e.genus)             { $('#genusSelect').val(e.genus); }
    $('#sonstigeDesignation').val(e.sonstigeDesignation || '');
    $('#sonstigeLatin').val(e.sonstigeLatin || '');
    if (e.sonstigeProtected) { $('#sonstigeProtected').val(e.sonstigeProtected); }
    $('#sonstigeHuntingSeason').val(e.sonstigeHuntingSeason || '');
    if (e.gender)            { $('select[name=gender]').val(e.gender); }
    $('input[name=animalCount]').val(e.animalCount || '');
    $('input[name=estimatedSize]').val(e.estimatedSize || '');
    $('input[name=estimatedWeight]').val(e.estimatedWeight || '');
    if (e.youngPresent)      { $('#youngSelect').val(e.youngPresent); }
    $('input[name=youngCount]').val(e.youngCount || '');

    // Abhaengige Bereiche (Sonstige-Felder, Jungtier-Anzahl, Info-Box) passend
    // ein-/ausblenden, indem wir die change-Handler einmal ausloesen.
    $('#genusSelect').trigger('change');
    $('#youngSelect').trigger('change');
}
