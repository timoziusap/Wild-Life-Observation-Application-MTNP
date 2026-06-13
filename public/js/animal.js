// animal.js
// Tier anlegen, anzeigen, bearbeiten und loeschen. Gattungs-Dropdown fuellen.


// Merkt sich die ID des Tieres, das gerade bearbeitet wird.
// Ist sie 0, wird ein NEUES Tier angelegt. Ist sie groesser 0,
// wird ein vorhandenes Tier geaendert.
var bearbeiteId = 0;

// Hier merken wir uns die geladenen Gattungen, damit wir beim Auswaehlen
// schnell an Schutzstatus und Jagdzeit kommen (fuer die Info-Box).
// Gleiches Muster wie alleOrte in observation.js.
var alleGattungen = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus).
    //    Das machen wir selbst (nicht ueber fillDropdown), weil wir die
    //    Gattungen zusaetzlich fuer die Info-Box speichern wollen.
    ladeGattungen();

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

    // 6) Jungtiere-Dropdown: bei "ja" das Feld fuer die Anzahl einblenden,
    //    sonst ausblenden (gleiches Muster wie bei "Sonstige").
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
            // Schutzstatus und Jagdzeit der neuen Gattung mitgeben
            'protectedSpecies' : $('#sonstigeProtected').val() === 'ja',
            'huntingSeason'    : $('#sonstigeHuntingSeason').val()
        };

        // Erst Gattung anlegen, dann im Erfolgsfall das Tier damit speichern.
        postJson('/genus', neueGattung, function(gattung) {
            // die neue Gattung auch in unsere gemerkte Liste aufnehmen
            alleGattungen.push(gattung);
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
    $('#youngCountBereich').hide();      // Jungtier-Anzahl wieder ausblenden
    $('#genusInfo').hide();              // Info-Box wieder ausblenden
    $('#newAnimalButton').val('Tier speichern');
    loadAnimalTable();
}


// Loescht ein Tier nach Rueckfrage (DELETE /animals/{id}).
function loescheAnimal(id) {
    if (confirm('Dieses Tier wirklich löschen?')) {
        deleteJson('/animals/' + id, loadAnimalTable);
    }
}


// Schreibt die Daten eines Tieres zurueck ins Formular, damit man sie aendern kann.
function bearbeiteAnimal(id, gender, estimatedAge, estimatedSize, estimatedWeight,
                         animalCount, youngPresent, youngCount, genusId) {
    bearbeiteId = id;
    $('select[name=gender]').val(gender);
    $('input[name=estimatedAge]').val(estimatedAge);
    $('input[name=estimatedSize]').val(estimatedSize);
    $('input[name=estimatedWeight]').val(estimatedWeight);
    $('input[name=animalCount]').val(animalCount);

    // Jungtiere-Dropdown und Anzahl-Feld passend setzen.
    if (youngPresent) {
        $('#youngSelect').val('ja');
        $('input[name=youngCount]').val(youngCount);
        $('#youngCountBereich').show();
    } else {
        $('#youngSelect').val('nein');
        $('input[name=youngCount]').val('');
        $('#youngCountBereich').hide();
    }

    $('#genusSelect').val(genusId);
    zeigeGattungsInfo();   // Info-Box zur Gattung gleich mit anzeigen
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
            { "data": "animalCount"     },
            { "data": "estimatedAge"    },
            { "data": "estimatedSize"   },
            { "data": "estimatedWeight" },
            // Jungtiere: Anzahl anzeigen wenn welche gesichtet wurden, sonst "keine".
            { "data": null, "render": function(zeile) {
                    if (zeile.youngPresent) {
                        return zeile.youngCount;
                    }
                    return "keine";
                }},
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
                    // youngPresent ist ein boolean und kommt deshalb ohne Anfuehrungszeichen mit.
                    var bearbeitenBtn =
                        '<button onclick="bearbeiteAnimal(' +
                        zeile.id + ',' +
                        '\'' + zeile.gender + '\',' +
                        '\'' + zeile.estimatedAge + '\',' +
                        '\'' + zeile.estimatedSize + '\',' +
                        '\'' + zeile.estimatedWeight + '\',' +
                        '\'' + zeile.animalCount + '\',' +
                        zeile.youngPresent + ',' +
                        '\'' + zeile.youngCount + '\',' +
                        '\'' + genusId + '\'' +
                        ')">Bearbeiten</button>';

                    var loeschenBtn =
                        '<button onclick="loescheAnimal(' + zeile.id + ')">Löschen</button>';

                    return bearbeitenBtn + ' ' + loeschenBtn;
                }}
        ]
    });
}
