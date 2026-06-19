// schutzzeiten.js
// AP13: Schutzzeiten pflegen - RESPONSIV.
//   - PC (breit):  Tabelle (Name, Status, Zeitraum, Aktion).
//   - Handy (schmal): Karten, nach Status gruppiert, ein-/ausklappbar.
//
// Status wird AUTOMATISCH aus dem Zeitraum abgeleitet:
//   - liegt das heutige Datum im eingetragenen (Schutz-)Zeitraum  -> "Geschützt"
//   - "ganzjährig geschont" o.ae. ohne Datum                      -> "Geschützt"
//   - sonst                                                       -> "Jagdbar"
// Es gibt KEIN manuelles "Geschützt? ja/nein" mehr.
//
// Bearbeiten ist gesperrt: erst der rote "Bearbeiten"-Button schaltet das
// Aendern von Zeitraum UND Name frei. Beim Speichern wird nachgefragt und der
// Name der aendernden Person verlangt.

var alleGattungen = [];

// Status-Gruppen (Karten) und Sortierrangfolge (Tabelle).
var statusGruppen = [
    { key: 'geschuetzt', titel: 'Geschützt' },
    { key: 'jagdbar',    titel: 'Jagdbar' }
];
var statusRang = { 'geschuetzt': 0, 'jagdbar': 1 };

var aktuellerModus = null;      // 'tabelle' | 'karten'
var bearbeitenAktiv = false;    // PC: globaler Bearbeiten-Modus


$(document).ready(function() {

    ladeGattungen();

    $('#genusSuche').on('input', function() {
        filtereListe($(this).val());
    });

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


function istHandy() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function heuteStr() {
    var h = new Date();
    return h.getFullYear() + '-'
        + ('0' + (h.getMonth() + 1)).slice(-2) + '-'
        + ('0' + h.getDate()).slice(-2);
}


// Ist die Gattung HEUTE geschuetzt? Rein aus dem Zeitraum abgeleitet:
// im eingetragenen Zeitraum = geschuetzt (Schutzzeit). "ganzjährig geschont"
// ohne Datum = immer geschuetzt.
function istGeschuetztJetzt(gattung) {
    if (!gattung) {
        return false;
    }
    var jagd = gattung.huntingSeason || '';
    var tief = jagd.toLowerCase();

    var klingtGeschont = tief.indexOf('geschont') !== -1
        || tief.indexOf('ganzjährig') !== -1
        || tief.indexOf('ganzjaehrig') !== -1;
    if (klingtGeschont && !/\d/.test(jagd)) {
        return true;
    }

    var treffer = jagd.match(/(\d{1,2})\.(\d{1,2})\.?\s*-\s*(\d{1,2})\.(\d{1,2})\./);
    if (!treffer) {
        return false;
    }
    var start = parseInt(treffer[2], 10) * 100 + parseInt(treffer[1], 10);
    var ende  = parseInt(treffer[4], 10) * 100 + parseInt(treffer[3], 10);

    var teile = heuteStr().split('-');
    var heute = parseInt(teile[1], 10) * 100 + parseInt(teile[2], 10);

    var imZeitraum;
    if (start <= ende) {
        imZeitraum = heute >= start && heute <= ende;
    } else {
        // Zeitraum laeuft ueber den Jahreswechsel.
        imZeitraum = heute >= start || heute <= ende;
    }
    return imZeitraum;   // im Zeitraum = geschuetzt
}


function statusKey(gattung) {
    return istGeschuetztJetzt(gattung) ? 'geschuetzt' : 'jagdbar';
}

function statusBadge(gattung) {
    if (statusKey(gattung) === 'geschuetzt') {
        return '<span class="status-badge badge-geschuetzt"><i class="bi bi-shield-fill"></i> Geschützt</span>';
    }
    return '<span class="status-badge badge-jagdbar"><i class="bi bi-check-circle"></i> Jagdbar</span>';
}

function suchtextVon(gattung) {
    return (gattung.designation + ' ' + (gattung.latinDesignation || '')).toLowerCase();
}

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

function findeOriginal(id) {
    var gefunden = null;
    $.each(alleGattungen, function(index, g) {
        if (g.id === id) {
            gefunden = g;
        }
    });
    return gefunden;
}


function ladeGattungen() {
    $.ajax({
        type: 'GET',
        url: '/genus',
        success: function(data) {
            alleGattungen = data;
            zeigeGattungen();
            filtereListe($('#genusSuche').val());
        },
        error: function(xhr, status, error) {
            console.log('Gattungen konnten nicht geladen werden: ' + error);
        }
    });
}

function zeigeGattungen() {
    aktuellerModus = istHandy() ? 'karten' : 'tabelle';
    if (aktuellerModus === 'karten') {
        zeigeKarten();
    } else {
        zeigeTabelle();
    }
}


/* ===================== Bestaetigung + Name ===================== */

// Fragt nach (Bestaetigung) und verlangt den Namen der aendernden Person.
// Rueckgabe: Name (String) oder null bei Abbruch.
function bestaetigeUndName(gattungName) {
    if (!confirm('Änderungen an "' + gattungName + '" wirklich speichern?')) {
        return null;
    }
    var wer = prompt('Bitte deinen Namen angeben (wer ändert?):');
    if (wer === null) {
        return null;
    }
    if (wer.trim() === '') {
        alert('Bitte einen Namen angeben.');
        return null;
    }
    return wer.trim();
}

// Speichert Name + Zeitraum einer Gattung (PUT /genus/{id}).
// behaelter = Tabellenzeile (PC) oder Karten-Body (Handy) mit den Eingabefeldern.
function speichereGattung(id, behaelter) {
    var original = findeOriginal(id);
    if (original === null) {
        return;
    }

    var editor = bestaetigeUndName(original.designation);
    if (editor === null) {
        return;   // abgebrochen
    }

    var neuerName = behaelter.find('.nameFeld').length
        ? behaelter.find('.nameFeld').val().trim()
        : original.designation;
    if (!neuerName) {
        neuerName = original.designation;
    }

    var geaendert = {
        'designation'      : neuerName,
        'latinDesignation' : original.latinDesignation,
        'protectedSpecies' : original.protectedSpecies,
        'huntingSeason'    : behaelter.find('.jagdZeit').val()
    };

    putJson('/genus/' + id, geaendert, function() {
        console.log('Schutzzeiten geändert von: ' + editor + ' (Gattung ' + id + ')');
        ladeGattungen();   // neu laden -> Status/Badges aktuell
    });
}


/* ===================== PC: Tabelle ===================== */

function zeigeTabelle() {
    var container = $('#genusCards');
    container.empty();

    // Werkzeugleiste mit rotem Bearbeiten-Button ueber der Tabelle.
    var leiste = $('<div class="sz-toolbar"></div>');
    var btn = $('<button type="button" class="sz-bearbeiten-btn"></button>');
    btn.html(bearbeitenAktiv
        ? '<i class="bi bi-check2"></i> Bearbeiten beenden'
        : '<i class="bi bi-pencil-square"></i> Bearbeiten');
    if (bearbeitenAktiv) {
        btn.addClass('aktiv');
    }
    btn.click(function() {
        bearbeitenAktiv = !bearbeitenAktiv;
        zeigeTabelle();
        filtereListe($('#genusSuche').val());
    });
    leiste.append(btn);
    if (bearbeitenAktiv) {
        leiste.append('<span class="sz-hinweis">Zeitraum und Name sind jetzt änderbar. Änderungen werden mit Namensabfrage gespeichert.</span>');
    }
    container.append(leiste);

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

    if (bearbeitenAktiv) {
        var nameTd = $('<td></td>');
        nameTd.append($('<input type="text" class="nameFeld sz-name-input">').val(gattung.designation));
        zeile.append(nameTd);

        zeile.append('<td class="sz-badge-zelle">' + statusBadge(gattung) + '</td>');

        var feldTd = $('<td></td>');
        feldTd.append($('<input type="text" class="jagdZeit" placeholder="z.B. 01.08. - 31.10. oder ganzjährig geschont">')
            .val(gattung.huntingSeason || ''));
        zeile.append(feldTd);

        var aktTd = $('<td class="sz-t-aktion"></td>');
        var sb = $('<button type="button" class="sz-save-aktiv"><i class="bi bi-save"></i> Speichern</button>');
        sb.click(function() { speichereGattung(gattung.id, zeile); });
        aktTd.append(sb);
        zeile.append(aktTd);

    } else {
        zeile.append('<td class="sz-name-zelle">' + gattung.designation + '</td>');
        zeile.append('<td class="sz-badge-zelle">' + statusBadge(gattung) + '</td>');
        zeile.append('<td class="sz-wert">' + (gattung.huntingSeason || '—') + '</td>');
        zeile.append('<td class="sz-t-aktion"></td>');
    }
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
    var imEdit = false;

    function renderBody() {
        body.empty();

        if (!imEdit) {
            body.append('<label class="sz-feld-label">Jagdzeitraum / Schutzbestimmung</label>');
            body.append('<div class="sz-wert">' + (gattung.huntingSeason || '—') + '</div>');
            var bbtn = $('<button type="button" class="sz-bearbeiten-btn"><i class="bi bi-pencil-square"></i> Bearbeiten</button>');
            bbtn.click(function(e) {
                e.stopPropagation();
                imEdit = true;
                renderBody();
            });
            body.append(bbtn);

        } else {
            body.append('<label class="sz-feld-label">Gattung (Name)</label>');
            body.append($('<input type="text" class="nameFeld">').val(gattung.designation));

            body.append('<label class="sz-feld-label">Jagdzeitraum / Schutzbestimmung</label>');
            body.append($('<input type="text" class="jagdZeit" placeholder="z.B. 01.08. - 31.10. oder ganzjährig geschont">')
                .val(gattung.huntingSeason || ''));

            var sbtn = $('<button type="button" class="sz-save-aktiv"><i class="bi bi-save"></i> Speichern</button>');
            sbtn.click(function(e) {
                e.stopPropagation();
                speichereGattung(gattung.id, body);
            });
            body.append(sbtn);

            var abbr = $('<button type="button" class="sz-abbrechen">Abbrechen</button>');
            abbr.click(function(e) {
                e.stopPropagation();
                imEdit = false;
                renderBody();
            });
            body.append(abbr);
        }
    }
    renderBody();

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

    $('.sz-card').each(function() {
        var treffer = ($(this).attr('data-such') || '').indexOf(suche) !== -1;
        $(this).toggle(suche === '' || treffer);
    });
    $('#genusCards .sz-gruppe-block').each(function() {
        var sichtbar = $(this).find('.sz-card:visible').length > 0;
        $(this).toggle(sichtbar);
    });
}
