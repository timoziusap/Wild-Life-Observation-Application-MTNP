// api.js
// Gemeinsame AJAX Helfer fuer alle Dialoge.
// Damit nicht jeder Dialog seinen eigenen $.ajax Code schreiben muss.


// Schickt ein Objekt als JSON per POST an die angegebene URL.
// url      = z.B. '/animals' oder '/locations'
// data     = das Objekt mit den Formularwerten
// onSuccess = Funktion die nach Erfolg aufgerufen wird (z.B. Tabelle neu laden)
function postJson(url, data, onSuccess) {
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(antwort) {
            // wenn eine Erfolgs-Funktion uebergeben wurde, rufen wir sie auf
            if (onSuccess) {
                onSuccess(antwort);
            }
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Speichern: ' + error);
        }
    });
}


// Fuellt ein Dropdown (select) mit Daten aus dem Backend.
// url        = z.B. '/genus'
// selectId   = die id vom select-Element, z.B. 'genusSelect'
// textFeld   = welches Feld als angezeigter Text dient, z.B. 'designation'
// wertFeld   = welches Feld als gespeicherter Wert dient, z.B. 'id'
function fillDropdown(url, selectId, textFeld, wertFeld) {
    $.ajax({
        type: 'GET',
        url: url,
        success: function(data) {
            var select = $('#' + selectId);

            // jeden Eintrag als <option> in das Dropdown haengen
            $.each(data, function(index, eintrag) {
                var option = $('<option></option>');
                option.val(eintrag[wertFeld]);
                option.text(eintrag[textFeld]);
                select.append(option);
            });
        },
        error: function(xhr, status, error) {
            console.log('Dropdown konnte nicht geladen werden: ' + error);
        }
    });
}
