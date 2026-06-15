// schutzzeiten.js
// AP13: Schutzzeiten pflegen.
// Listet alle Gattungen (GET /genus) und laesst pro Gattung den Schutzstatus
// und den Jagdzeitraum bearbeiten (PUT /genus/{id}). Unten kann optional eine
// neue Gattung angelegt werden (POST /genus).

// gemerkte Gattungen, damit wir beim Speichern die unveraenderten Felder
// (Bezeichnung, lateinischer Name) wieder mitschicken koennen.
var alleGattungen = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungen laden und Tabelle aufbauen.
    ladeGattungen();

    // 2) Formular: neue Gattung anlegen.
    $('#newGenus').submit(function(event) {
        event.preventDefault();
        legeGattungAn();
    });
});


// Laedt alle Gattungen vom Backend und baut die Tabelle.
function ladeGattungen() {
    $.ajax({
        type: 'GET',
        url: '/genus',
        success: function(data) {
            alleGattungen = data;
            zeigeGattungen();
        },
        error: function(xhr, status, error) {
            console.log('Gattungen konnten nicht geladen werden: ' + error);
        }
    });
}


// Baut die Tabelle mit einer Zeile pro Gattung neu auf.
function zeigeGattungen() {
    var body = $('#genusBody');
    body.empty();

    $.each(alleGattungen, function(index, gattung) {

        var zeile = $('<tr></tr>');

        // Spalte 1: Bezeichnung, der lateinische Name klein darunter.
        var name = gattung.designation;
        if (gattung.latinDesignation) {
            name = name + '<br><small>' + gattung.latinDesignation + '</small>';
        }
        zeile.append('<td>' + name + '</td>');

        // Spalte 2: Schutzstatus als Dropdown (ja/nein), aktueller Wert vorausgewaehlt.
        var tdSchutz = $('<td></td>');
        var schutzAuswahl = $('<select class="schutzStatus">'
            + '<option value="nein">nein</option>'
            + '<option value="ja">ja</option>'
            + '</select>');
        if (gattung.protectedSpecies) {
            schutzAuswahl.val('ja');
        }
        tdSchutz.append(schutzAuswahl);
        zeile.append(tdSchutz);

        // Spalte 3: Jagdzeitraum / Schutzbestimmung als Textfeld.
        var tdJagd = $('<td></td>');
        var feld = $('<input type="text" class="jagdZeit">');
        feld.val(gattung.huntingSeason ? gattung.huntingSeason : '');
        tdJagd.append(feld);
        zeile.append(tdJagd);

        // Spalte 4: Speichern-Knopf fuer diese Zeile.
        var tdAktion = $('<td></td>');
        var speichern = $('<button type="button">Speichern</button>');
        // beim Klick die id der Gattung und die aktuelle Zeile mitgeben
        speichern.click(function() {
            speichereGattung(gattung.id, $(this).closest('tr'));
        });
        tdAktion.append(speichern);
        zeile.append(tdAktion);

        body.append(zeile);
    });
}


// Speichert die Aenderungen einer Gattung per PUT /genus/{id}.
// Wir schicken das komplette Objekt mit (auch Bezeichnung + lateinischer Name),
// damit save() diese Felder nicht leert.
function speichereGattung(id, zeile) {

    // die urspruengliche Gattung in der gemerkten Liste finden
    var original = null;
    $.each(alleGattungen, function(index, g) {
        if (g.id === id) {
            original = g;
        }
    });
    if (original === null) {
        return;
    }

    var geaendert = {
        'designation'      : original.designation,
        'latinDesignation' : original.latinDesignation,
        // Dropdown-Text "ja"/"nein" in echtes true/false uebersetzen
        'protectedSpecies' : zeile.find('.schutzStatus').val() === 'ja',
        'huntingSeason'    : zeile.find('.jagdZeit').val()
    };

    putJson('/genus/' + id, geaendert, function() {
        // nach dem Speichern neu laden, damit ueberall der aktuelle Stand steht
        ladeGattungen();
        alert('Gespeichert.');
    });
}


// Legt eine neue Gattung an (POST /genus).
function legeGattungAn() {

    var bezeichnung = $('#neueDesignation').val();
    if (!bezeichnung) {
        alert('Bitte eine Bezeichnung eingeben.');
        return;
    }

    var neueGattung = {
        'designation'      : bezeichnung,
        'latinDesignation' : $('#neueLatin').val(),
        'protectedSpecies' : $('#neueProtected').val() === 'ja',
        'huntingSeason'    : $('#neueHuntingSeason').val()
    };

    postJson('/genus', neueGattung, function() {
        // Formular leeren und Tabelle neu laden
        $('#newGenus')[0].reset();
        ladeGattungen();
    });
}
