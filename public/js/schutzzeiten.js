// schutzzeiten.js
// AP13: Schutzzeiten pflegen - RESPONSIV.
//   - PC (breit):  Tabelle (Name, Status, Jagdzeitraum-Feld, Speichern).
//   - Handy (schmal): Karten, nach Status gruppiert, Gruppen UND Karten
//                     einklappbar; pro Karte zusaetzlich "Geschützt?".
// Gespeichert wird per PUT /genus/{id}; nur wenn etwas geaendert wurde.
// Beim Drehen/Resizen wird zwischen Tabelle und Karten umgeschaltet.

var alleGattungen = [];

// Status-Gruppen (fuer die Karten) und Sortierrangfolge (fuer die Tabelle).
var statusGruppen = [
    { key: 'geschuetzt', titel: 'Geschützt' },
    { key: 'schonzeit',  titel: 'In Schonzeit' },
    { key: 'jagdbar',    titel: 'Jagdbar' }
];
var statusRang = { 'geschuetzt': 0, 'schonzeit': 1, 'jagdbar': 2 };

// merkt sich, ob aktuell Tabelle ('tabelle') oder Karten ('karten') gezeigt werden.
var aktuellerModus = null;


$(document).ready(function() {

    ladeGattungen();

    // Suchfeld: filtert Zeilen bzw. Karten nach Name.
    $('#genusSuche').on('input', function() {
        filtereListe($(this).val());
    });

    // Bei Groessenaenderung ggf. zwischen Tabelle und Karten umschalten.
    var timer;
    $(window).on('resize', function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            var modus = istHandy() ? 'karten' : 'tabelle';
            if (modus !== aktuellerModus) {
                zeigeGattungen();
                filtereListe($('#genusSuche').val());
            }
        }, 150);
    });
});


// true, wenn die Anzeige im Handy-Format ist (gleiche Grenze wie im CSS).
function istHandy() {
    return window.matchMedia('(max-width: 768px)').matches;
}


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
    return hinweis ? 'schonzeit' : 'jagdbar';
}


// Farbiges Status-Schild.
function statusBadge(gattung) {
    var key = statusKey(gattung);
    if (key === 'geschuetzt') {
        return '<span class="status-badge badge-geschuetzt"><i class="bi bi-shield-fill"></i> Geschützt</span>';
    }
    if (key === 'schonzeit') {
        return '<span class="status-badge badge-schonzeit"><i class="bi bi-clock-history"></i> Schonzeit</span>';
    }
    return '<span class="status-badge badge-jagdbar"><i class="bi bi-check-circle"></i> Jagdbar</span>';
}


// Suchtext (Name + lateinischer Name) fuer den Filter.
function suchtextVon(gattung) {
    return (gattung.designation + ' ' + (gattung.latinDesignation || '')).toLowerCase();
}


// Gattungen nach Status (Geschützt zuerst), dann alphabetisch sortiert.
function sortiereNachStatus(liste) {
    return liste.slice().sort(function(a, b) {
        var ra = statusRang[statusKey(a)];
        var rb = statusRang[statusKey(b)];
        if (ra !== rb) {
            return ra - rb;
        }
        return a.designation.localeCompare(b.designation, 'de');
    });
}


// Findet die gemerkte Gattung anhand der id.
function findeOriginal(id) {
    var gefunden = null;
    $.each(alleGattungen, function(index, g) {
        if (g.id === id) {
            gefunden = g;
        }
    });
    return gefunden;
}


// Laedt alle Gattungen vom Backend und baut die Anzeige.
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


// Entscheidet je nach Bildschirmbreite zwischen Tabelle und Karten.
function zeigeGattungen() {
    aktuellerModus = istHandy() ? 'karten' : 'tabelle';
    if (aktuellerModus === 'karten') {
        zeigeKarten();
    } else {
        zeigeTabelle();
    }
}


/* ===================== PC: Tabelle ===================== */

function zeigeTabelle() {
    var container = $('#genusCards');
    container.empty();

    var tabelle = $('<table class="sz-tabelle"></table>');
    tabelle.append(
        '<thead><tr>'
        + '<th class="sz-t-name">Gattung</th>'
        + '<th class="sz-t-status">Status</th>'
        + '<th>Jagdzeitraum / Schutzbestimmung</th>'
        + '<th class="sz-t-aktion">Aktion</th>'
        + '</tr></thead>');

    var tbody = $('<tbody></tbody>');
    sortiereNachStatus(alleGattungen).forEach(function(gattung) {
        tbody.append(baueZeile(gattung));
    });
    tabelle.append(tbody);
    container.append(tabelle);
}


function baueZeile(gattung) {
    var zeile = $('<tr data-such="' + suchtextVon(gattung) + '"></tr>');

    zeile.append('<td class="sz-name-zelle">' + gattung.designation + '</td>');
    zeile.append('<td class="sz-badge-zelle">' + statusBadge(gattung) + '</td>');

    var feldTd = $('<td></td>');
    var feld = $('<input type="text" class="jagdZeit" placeholder="z.B. 01.08. - 31.01. oder ganzjährig">');
    feld.val(gattung.huntingSeason || '');
    feldTd.append(feld);
    zeile.append(feldTd);

    var aktionTd = $('<td class="sz-t-aktion"></td>');
    var speichern = $('<button type="button" class="sz-save" disabled>'
        + '<i class="bi bi-check2"></i> Gespeichert</button>');
    speichern.click(function() {
        speichereGattung(gattung.id, zeile, false);
    });
    aktionTd.append(speichern);
    zeile.append(aktionTd);

    feld.on('input', function() {
        speichern.prop('disabled', false).html('<i class="bi bi-save"></i> Speichern');
    });

    return zeile;
}


/* ===================== Handy: Karten ===================== */

function zeigeKarten() {
    var container = $('#genusCards');
    container.empty();

    statusGruppen.forEach(function(gruppe) {
        var inGruppe = alleGattungen.filter(function(g) {
            return statusKey(g) === gruppe.key;
        });
        if (inGruppe.length === 0) {
            return;
        }
        inGruppe.sort(function(a, b) {
            return a.designation.localeCompare(b.designation, 'de');
        });

        var block = $('<div class="sz-gruppe-block sz-gruppe-' + gruppe.key + '"></div>');
        var ueberschrift = $('<h3 class="sz-gruppe">'
            + '<i class="bi bi-chevron-down sz-chevron"></i>'
            + '<span class="sz-gruppe-titel">' + gruppe.titel + '</span>'
            + '<span class="sz-gruppe-zahl">' + inGruppe.length + '</span>'
            + '</h3>');
        ueberschrift.on('click', function() {
            block.toggleClass('sz-zu');
        });
        block.append(ueberschrift);

        var grid = $('<div class="sz-grid"></div>');
        inGruppe.forEach(function(gattung) {
            grid.append(baueKarte(gattung));
        });
        block.append(grid);
        container.append(block);
    });
}


function baueKarte(gattung) {
    var key = statusKey(gattung);

    // Am Handy standardmaessig zugeklappt (kompakt).
    var karte = $('<div class="sz-card sz-card-' + key + ' sz-card-zu" data-such="' + suchtextVon(gattung) + '"></div>');

    var kopf = $('<div class="sz-card-kopf"></div>');
    var namensBlock = '<div class="sz-namensblock"><span class="sz-name">' + gattung.designation + '</span>';
    if (gattung.latinDesignation) {
        namensBlock += '<span class="sz-latin">' + gattung.latinDesignation + '</span>';
    }
    namensBlock += '</div>';
    kopf.append(namensBlock);
    kopf.append('<span class="sz-kopf-rechts">'
        + '<span class="sz-badge-wrap">' + statusBadge(gattung) + '</span>'
        + '<i class="bi bi-chevron-down sz-chevron"></i>'
        + '</span>');
    kopf.on('click', function() {
        karte.toggleClass('sz-card-zu');
    });
    karte.append(kopf);

    var body = $('<div class="sz-card-body"></div>');

    body.append('<label class="sz-feld-label">Geschützt?</label>');
    var schutzAuswahl = $('<select class="schutzStatus">'
        + '<option value="nein">nein</option>'
        + '<option value="ja">ja</option>'
        + '</select>');
    if (gattung.protectedSpecies) {
        schutzAuswahl.val('ja');
    }
    body.append(schutzAuswahl);

    body.append('<label class="sz-feld-label">Jagdzeitraum / Schutzbestimmung</label>');
    var feld = $('<input type="text" class="jagdZeit" placeholder="z.B. 01.08. - 31.01. oder ganzjährig">');
    feld.val(gattung.huntingSeason || '');
    body.append(feld);

    var speichern = $('<button type="button" class="sz-save" disabled>'
        + '<i class="bi bi-check2"></i> Gespeichert</button>');
    speichern.click(function() {
        speichereGattung(gattung.id, karte, true);
    });
    body.append(speichern);

    function alsGeaendertMarkieren() {
        karte.addClass('sz-dirty');
        speichern.prop('disabled', false).html('<i class="bi bi-save"></i> Speichern');
    }
    schutzAuswahl.on('change', alsGeaendertMarkieren);
    feld.on('input', alsGeaendertMarkieren);

    karte.append(body);
    return karte;
}


/* ===================== Suche ===================== */

function filtereListe(text) {
    var suche = (text || '').trim().toLowerCase();

    if (aktuellerModus === 'tabelle') {
        $('#genusCards tbody tr').each(function() {
            var treffer = ($(this).attr('data-such') || '').indexOf(suche) !== -1;
            $(this).toggle(suche === '' || treffer);
        });
        return;
    }

    // Karten-Modus: Karten filtern, leere Gruppen ausblenden.
    $('.sz-card').each(function() {
        var treffer = ($(this).attr('data-such') || '').indexOf(suche) !== -1;
        $(this).toggle(suche === '' || treffer);
    });
    $('#genusCards .sz-gruppe-block').each(function() {
        var sichtbar = $(this).find('.sz-card:visible').length > 0;
        $(this).toggle(sichtbar);
    });
}


/* ===================== Speichern ===================== */

// behaelter = die Zeile (Tabelle) oder die Karte (Handy).
// mitSchutz = true -> Schutzstatus aus dem Dropdown (nur Karten);
//             false -> Schutzstatus unveraendert aus dem Original (Tabelle).
function speichereGattung(id, behaelter, mitSchutz) {

    var original = findeOriginal(id);
    if (original === null) {
        return;
    }

    var geaendert = {
        'designation'      : original.designation,
        'latinDesignation' : original.latinDesignation,
        'protectedSpecies' : mitSchutz ? (behaelter.find('.schutzStatus').val() === 'ja') : original.protectedSpecies,
        'huntingSeason'    : behaelter.find('.jagdZeit').val()
    };

    putJson('/genus/' + id, geaendert, function() {
        original.protectedSpecies = geaendert.protectedSpecies;
        original.huntingSeason = geaendert.huntingSeason;

        // Status-Schild neu setzen (Farbe kann sich geaendert haben).
        behaelter.find('.sz-badge-wrap, .sz-badge-zelle').html(statusBadge(original));

        behaelter.removeClass('sz-dirty');
        var btn = behaelter.find('.sz-save');
        btn.prop('disabled', true).html('<i class="bi bi-check2-circle"></i> Gespeichert');
    });
}
