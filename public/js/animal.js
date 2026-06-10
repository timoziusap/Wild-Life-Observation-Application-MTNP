// animal.js
// Tier anlegen, anzeigen, bearbeiten und loeschen. Gattungs-Dropdown fuellen.


// Merkt sich die ID des Tieres, das gerade bearbeitet wird.
// Ist sie 0, wird ein NEUES Tier angelegt. Ist sie groesser 0,
// wird ein vorhandenes Tier geaendert.
var bearbeiteId = 0;


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus).
    //    "designation" ist der angezeigte Text, "id" der gespeicherte Wert.
    fillDropdown('/genus', 'genusSelect', 'designation', 'id');

    // 2) Tier-Tabelle beim Laden der Seite einmal anzeigen.
    loadAnimalTable();

    // 3) Wenn das Formular abgeschickt wird, Tier speichern.
    $("#newAnimal").submit(function(event) {
        postAnimal(event);
    });

    // 4) Klick auf "Laden" zeigt die Tabelle neu an.
    $('#loadAnimalTable').click(function() {
        loadAnimalTable();
    });

    // 5) Wenn im Dropdown "Sonstige" gewaehlt wird, die Felder fuer die
    //    neue Gattung einblenden, sonst ausblenden.
    $('#genusSelect').change(function() {
        if ($('#genusSelect').val() === 'sonstige') {
            $('#sonstigeGenusBereich').show();
        } else {
            $('#sonstigeGenusBereich').hide();
        }
    });
});


// Liest die Formularfelder aus und speichert das Tier.
// Je nachdem ob bearbeiteId gesetzt ist, wird angelegt (POST) oder geaendert (PUT).
function postAnimal(event) {

    // Verhindert, dass die Seite beim Absenden neu laedt.
    event.preventDefault();

    // Werte aus dem Formular einsammeln.
    var formData = {
        'gender'          : $('select[name=gender]').val(),
        'estimatedAge'    : $('input[name=estimatedAge]').val(),
        'estimatedSize'   : $('input[name=estimatedSize]').val(),
        'estimatedWeight' : $('input[name=estimatedWeight]').val()
    };

    // Wurde "Sonstige" gewaehlt, legen wir erst die neue Gattung an
    // und speichern danach das Tier mit deren id.
    if ($('#genusSelect').val() === 'sonstige') {

        var bezeichnung = $('#sonstigeDesignation').val();
        if (!bezeichnung) {
            alert('Bitte eine Bezeichnung fuer die neue Gattung eingeben.');
            return;
        }

        var neueGattung = {
            'designation'      : bezeichnung,
            'latinDesignation' : $('#sonstigeLatin').val()
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


// Speichert das Tier. Je nach bearbeiteId wird angelegt (POST) oder geaendert (PUT).
function speichereTier(formData) {
    if (bearbeiteId === 0) {
        // Neues Tier anlegen; nach Erfolg Formular zuruecksetzen + Tabelle neu laden.
        postJson('/animals', formData, nachSpeichern);
    } else {
        // Vorhandenes Tier aendern. Die ID muss mit ins Objekt.
        formData.id = bearbeiteId;
        putJson('/animals/' + bearbeiteId, formData, nachSpeichern);
    }
}


// Wird nach erfolgreichem Speichern aufgerufen:
// Formular leeren, zurueck in den "Neu"-Modus, Tabelle neu laden.
function nachSpeichern() {
    bearbeiteId = 0;
    $('#newAnimal')[0].reset();
    $('#sonstigeGenusBereich').hide();   // Felder fuer neue Gattung wieder ausblenden
    $('#newAnimalButton').val('Tier speichern');
    loadAnimalTable();
}


// Loescht ein Tier nach Rueckfrage (DELETE /animals/{id}).
function loescheAnimal(id) {
    if (confirm('Dieses Tier wirklich loeschen?')) {
        deleteJson('/animals/' + id, loadAnimalTable);
    }
}


// Schreibt die Daten eines Tieres zurueck ins Formular, damit man sie aendern kann.
function bearbeiteAnimal(id, gender, estimatedAge, estimatedSize, estimatedWeight, genusId) {
    bearbeiteId = id;
    $('select[name=gender]').val(gender);
    $('input[name=estimatedAge]').val(estimatedAge);
    $('input[name=estimatedSize]').val(estimatedSize);
    $('input[name=estimatedWeight]').val(estimatedWeight);
    $('#genusSelect').val(genusId);
    $('#newAnimalButton').val('Aenderung speichern');
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
                }},
            // Letzte Spalte: Buttons zum Bearbeiten und Loeschen.
            // "data": null heisst, wir bauen den Inhalt selbst aus der ganzen Zeile.
            { "data": null, "orderable": false, "render": function(zeile) {

                    // Die Gattungs-ID heraussuchen (kann fehlen).
                    var genusId = "";
                    if (zeile.genus && zeile.genus.id) {
                        genusId = zeile.genus.id;
                    }

                    // Bearbeiten-Button: gibt die Werte der Zeile mit, damit
                    // das Formular damit gefuellt werden kann.
                    var bearbeitenBtn =
                        '<button onclick="bearbeiteAnimal(' +
                        zeile.id + ',' +
                        '\'' + zeile.gender + '\',' +
                        '\'' + zeile.estimatedAge + '\',' +
                        '\'' + zeile.estimatedSize + '\',' +
                        '\'' + zeile.estimatedWeight + '\',' +
                        '\'' + genusId + '\'' +
                        ')">Bearbeiten</button>';

                    var loeschenBtn =
                        '<button onclick="loescheAnimal(' + zeile.id + ')">Loeschen</button>';

                    return bearbeitenBtn + ' ' + loeschenBtn;
                }}
        ]
    });
}