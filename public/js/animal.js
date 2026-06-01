//animal.js
// Tier anlegen, Tier-Tabelle laden, Gattungs-Dropdown fuellen.


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus).
    //    "designation" ist der angezeigte Text, "id" der gespeicherte Wert.
    fillDropdown('/genus', 'genusSelect', 'designation', 'id');

    // 2) Tier-Tabelle beim Laden der Seite einmal anzeigen.
    loadAnimalTable();

    // 3) Wenn das Formular abgeschickt wird, neues Tier speichern.
    $("#newAnimal").submit(function(event) {
        postAnimal(event);
    });

    // 4) Klick auf "Laden" zeigt die Tabelle neu an.
    $('#loadAnimalTable').click(function() {
        loadAnimalTable();
    });
});


// Liest die Formularfelder aus und schickt das neue Tier ans Backend.
function postAnimal(event) {

    // Werte aus dem Formular einsammeln.
    var formData = {
        'gender'          : $('input[name=gender]').val(),
        'estimatedAge'    : $('input[name=estimatedAge]').val(),
        'estimatedSize'   : $('input[name=estimatedSize]').val(),
        'estimatedWeight' : $('input[name=estimatedWeight]').val(),
        // Das Tier verweist auf eine Gattung. Spring erwartet ein
        // Objekt mit der id, deshalb verpacken wir den gewaehlten Wert so.
        'genus'           : { 'id' : $('#genusSelect').val() }
    };

    // Per Helfer absenden; nach Erfolg Tabelle neu laden.
    postJson('/animals', formData, loadAnimalTable);

    // Verhindert, dass die Seite beim Absenden neu laedt.
    event.preventDefault();
}


// Laedt alle Tiere in die DataTable.
function loadAnimalTable() {
    $('#animalTable').DataTable({
        destroy: true,             // alte Tabelle vorher verwerfen
        "ajax": {
            "url"     : '/animals',
            "dataSrc" : "",        // flaches JSON-Array, kein Wrapper-Objekt
            "error"   : function(xhr, error, thrown) {
                console.log('Tier-Tabelle konnte nicht geladen werden: ' + thrown);
            }
        },
        "columns": [
            { "data": "id"              },
            { "data": "gender"          },
            { "data": "estimatedAge"    },
            { "data": "estimatedSize"   },
            { "data": "estimatedWeight" },
            // Die Gattung ist ein verschachteltes Objekt. Wir zeigen die
            // Bezeichnung an, falls vorhanden, sonst ein leeres Feld.
            { "data": "genus", "render": function(genus) {
                    if (genus && genus.designation) {
                        return genus.designation;
                    }
                    return "";
                }}
        ]
    });
}
