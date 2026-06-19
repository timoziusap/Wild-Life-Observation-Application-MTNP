// schutzzeiten.js
// AP13: Schutzzeiten pflegen - tabellarische Ansicht.
// Listet alle Gattungen (GET /genus) in einer Tabelle.
// Pro Zeile: Name (gross), Status-Badge, Jagdzeitraum als Textfeld (editierbar),
// Speichern-Knopf. Lateinname und "Geschuetzt?"-Dropdown sind raus (redundant).

// gemerkte Gattungen, damit wir beim Speichern die unveraenderten Felder
// wieder mitschicken koennen.
var alleGattungen = [];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {
    ladeGattungen();
});


// Bestimmt den Status einer Gattung: geschuetzt / schonzeit / jagdbar.
function statusKey(gattung) {
    if (gattung.protectedSpecies) {
        return 'geschuetzt';
    }
    var heute = new Date();
    var heuteStr = heute.getFullYear() + '-'
        + ('0' + (heute.getMonth() + 1)).slice(-2) + '-'
        + ('0' + heute.getDate()).slice(-2);
    var hinweis = (typeof schonzeitHinweis === 'function') ? schonzeitHinweis(gattung, heuteStr) : '';
    return hinweis ? 'schonzeit' : 'jagdzeit';
}


// Sortierrangfolge: Geschuetzt zuerst, dann Schonzeit, dann Jagdzeit.
var statusRang = { 'geschuetzt': 0, 'schonzeit': 1, 'jagdzeit': 2 };

// Baut das farbige Status-Schild fuer eine Gattung.
function statusBadge(gattung) {
    var key = statusKey(gattung);
    if (key === 'geschuetzt') {
        return '<span class="status-badge badge-geschuetzt"><i class="bi bi-shield-fill"></i> Geschützt</span>';
    }
    if (key === 'schonzeit') {
        return '<span class="status-badge badge-schonzeit"><i class="bi bi-clock-history"></i> Schonzeit</span>';
    }
    return '<span class="status-badge badge-jagdbar"><i class="bi bi-check-circle"></i> Jagdzeit</span>';
}


// Laedt alle Gattungen vom Backend und fuellt die Tabelle.
function ladeGattungen() {
    $.ajax({
        type: 'GET',
        url: '/genus',
        success: function(data) {
            alleGattungen = data;
            fuelleTabelle();
        },
        error: function(xhr, status, error) {
            console.log('Gattungen konnten nicht geladen werden: ' + error);
        }
    });
}


// Fuellt die Tabelle mit allen Gattungen, sortiert nach Status
// (Geschuetzt zuerst, dann Schonzeit, dann Jagdzeit).
function fuelleTabelle() {
    var tbody = $('#genusBody');
    tbody.empty();

    var sortiert = alleGattungen.slice().sort(function(a, b) {
        var ra = statusRang[statusKey(a)] !== undefined ? statusRang[statusKey(a)] : 99;
        var rb = statusRang[statusKey(b)] !== undefined ? statusRang[statusKey(b)] : 99;
        if (ra !== rb) return ra - rb;
        // Innerhalb derselben Gruppe alphabetisch.
        return a.designation.localeCompare(b.designation, 'de');
    });

    sortiert.forEach(function(gattung) {
        tbody.append(baueZeile(gattung));
    });
}


// Baut eine Tabellenzeile fuer eine Gattung.
function baueZeile(gattung) {
    var zeile = $('<tr data-id="' + gattung.id + '"></tr>');

    // Spalte 1: Name (gross).
    zeile.append('<td class="sz-name-zelle">' + gattung.designation + '</td>');

    // Spalte 2: Status-Badge.
    zeile.append('<td class="sz-badge-zelle">' + statusBadge(gattung) + '</td>');

    // Spalte 3: Jagdzeitraum als editierbares Textfeld.
    var jagdZeitTd = $('<td></td>');
    var feld = $('<input type="text" class="jagdZeit" placeholder="z.B. 01.08. – 31.01. oder ganzjährig">');
    feld.val(gattung.huntingSeason || '');
    jagdZeitTd.append(feld);
    zeile.append(jagdZeitTd);

    // Spalte 4: Speichern-Knopf (anfangs deaktiviert).
    var speichernTd = $('<td></td>');
    var speichern = $('<button type="button" class="sz-save" disabled>'
        + '<i class="bi bi-check2"></i> Gespeichert</button>');
    speichern.click(function() {
        speichereGattung(gattung.id, zeile);
    });
    speichernTd.append(speichern);
    zeile.append(speichernTd);

    // Aenderung im Textfeld: Knopf aktiv schalten.
    feld.on('input', function() {
        speichern.prop('disabled', false).html('<i class="bi bi-save"></i> Speichern');
    });

    return zeile;
}


// Speichert die Aenderungen einer Gattung per PUT /genus/{id}.
function speichereGattung(id, zeile) {
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
        'protectedSpecies' : original.protectedSpecies,
        'huntingSeason'    : zeile.find('.jagdZeit').val()
    };

    putJson('/genus/' + id, geaendert, function() {
        // gemerkte Daten aktualisieren.
        original.huntingSeason = geaendert.huntingSeason;

        // Status-Badge neu setzen (falls sich etwas geaendert hat).
        zeile.find('.sz-badge-zelle').html(statusBadge(original));

        // Knopf wieder deaktivieren.
        var btn = zeile.find('.sz-save');
        btn.prop('disabled', true).html('<i class="bi bi-check2-circle"></i> Gespeichert');
    });
}
