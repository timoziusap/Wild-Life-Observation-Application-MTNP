// tier.js
// Tiersichtung anlegen, Schritt 1: das Tier erfassen und speichern.
// Nach dem Speichern merken wir uns die neue Tier-id und gehen weiter zu ort.html.

// Hier merken wir uns die geladenen Gattungen, damit wir beim Auswaehlen
// schnell an Schutzstatus und Jagdzeit kommen (fuer die Info-Box).
var alleGattungen = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus).
    ladeGattungen();

    // 2) Wenn das Formular abgeschickt wird, Tier speichern und weiter.
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

            var text = '';
            if (gattung.protectedSpecies) {
                text = 'GESCHÜTZTE ART - darf nicht bejagt werden.';
            } else {
                text = 'Nicht geschützt.';
            }
            if (gattung.huntingSeason) {
                text = text + ' Jagdzeit: ' + gattung.huntingSeason;
            }

            $('#genusInfo').text(text).show();
        }
    });
}


// Liest die Formularfelder aus, speichert das Tier und geht dann weiter.
function weiter(event) {

    // Verhindert, dass die Seite beim Absenden neu laedt.
    event.preventDefault();

    // Werte aus dem Formular einsammeln.
    // Das Feld "Geschaetztes Alter" gibt es hier nicht mehr (AP9), also kein estimatedAge.
    var formData = {
        'gender'          : $('select[name=gender]').val(),
        'estimatedSize'   : $('input[name=estimatedSize]').val(),
        'estimatedWeight' : $('input[name=estimatedWeight]').val(),
        'animalCount'     : $('input[name=animalCount]').val(),
        // echtes true/false schicken, nicht den Text aus dem Dropdown
        'youngPresent'    : $('#youngSelect').val() === 'ja',
        'youngCount'      : 0
    };

    // Anzahl der Jungtiere nur uebernehmen, wenn auch welche gesichtet wurden.
    if (formData.youngPresent) {
        formData.youngCount = $('input[name=youngCount]').val();
    }

    // Wurde "Sonstige" gewaehlt, legen wir erst die neue Gattung an
    // und speichern danach das Tier mit deren id.
    if ($('#genusSelect').val() === 'sonstige') {

        var bezeichnung = $('#sonstigeDesignation').val();
        if (!bezeichnung) {
            alert('Bitte eine Bezeichnung für die neue Gattung eingeben.');
            return;
        }

        var neueGattung = {
            'designation'      : bezeichnung,
            'latinDesignation' : $('#sonstigeLatin').val(),
            'protectedSpecies' : $('#sonstigeProtected').val() === 'ja',
            'huntingSeason'    : $('#sonstigeHuntingSeason').val()
        };

        // Erst Gattung anlegen, dann im Erfolgsfall das Tier damit speichern.
        postJson('/genus', neueGattung, function(gattung) {
            formData.genus = { 'id' : gattung.id };
            speichereTier(formData);
        });

    } else {
        // Normale Auswahl aus der Liste: id der gewaehlten Gattung mitgeben.
        formData.genus = { 'id' : $('#genusSelect').val() };
        speichereTier(formData);
    }
}


// Speichert das Tier per POST /animals.
// Aus der Antwort merken wir die neue id und gehen dann zu Schritt 2 (Ort).
function speichereTier(formData) {
    postJson('/animals', formData, function(tier) {
        // die neue Tier-id fuer Schritt 2 (ort.html) merken
        sessionStorage.setItem('neueAnimalId', tier.id);
        // weiter zur Ort-Seite
        window.location.href = 'ort.html';
    });
}
