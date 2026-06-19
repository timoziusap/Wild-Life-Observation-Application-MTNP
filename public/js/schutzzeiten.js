// schutzzeiten.js
// AP13: Schutzzeiten pflegen - als Karten (Handy + PC).
// Listet alle Gattungen (GET /genus) als Karten, nach Status gruppiert
// (Geschützt / Schonzeit / Jagdbar). Pro Karte laesst sich der Schutzstatus
// und der Jagdzeitraum bearbeiten (PUT /genus/{id}). Gespeichert wird nur,
// wenn wirklich etwas geaendert wurde; ein Suchfeld filtert nach Name.
//
// NUR auf dem Handy lassen sich Gruppen UND einzelne Karten einklappen
// (das Ein-/Ausblenden steuert allein das CSS in der Handy-Breite; am PC
// bleibt alles offen). Die Klick-Handler setzen lediglich Marker-Klassen.

// gemerkte Gattungen, damit wir beim Speichern die unveraenderten Felder
// (Bezeichnung, lateinischer Name) wieder mitschicken koennen.
var alleGattungen = [];

// Reihenfolge und Beschriftung der Status-Gruppen.
var statusGruppen = [
    { key: 'geschuetzt', titel: 'Geschützt' },
    { key: 'schonzeit',  titel: 'In Schonzeit' },
    { key: 'jagdbar',    titel: 'Jagdbar' }
];


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungen laden und Karten aufbauen.
    ladeGattungen();

    // 2) Suchfeld: Karten nach Name filtern (ohne Neuaufbau, damit
    //    angefangene Aenderungen erhalten bleiben).
    $('#genusSuche').on('input', function() {
        filtereKarten($(this).val());
    });
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
    return hinweis ? 'schonzeit' : 'jagdbar';
}


// Baut das farbige Status-Schild fuer eine Gattung.
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


// Laedt alle Gattungen vom Backend und baut die Karten.
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


// Baut alle Karten neu auf, nach Status gruppiert.
function zeigeGattungen() {
    var container = $('#genusCards');
    container.empty();

    statusGruppen.forEach(function(gruppe) {
        var inGruppe = alleGattungen.filter(function(g) {
            return statusKey(g) === gruppe.key;
        });
        if (inGruppe.length === 0) {
            return;
        }

        // Block = Ueberschrift + Karten-Raster. Die Ueberschrift ist (am Handy)
        // anklickbar und klappt das Raster ein/aus.
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


// Baut eine einzelne Gattungs-Karte.
function baueKarte(gattung) {
    var key = statusKey(gattung);
    var suchtext = (gattung.designation + ' ' + (gattung.latinDesignation || '')).toLowerCase();

    // Am Handy ist die Karte standardmaessig zugeklappt (kompakt). Das
    // tatsaechliche Aus-/Einblenden macht das CSS nur in der Handy-Breite.
    var karte = $('<div class="sz-card sz-card-' + key + ' sz-card-zu" data-such="' + suchtext + '"></div>');

    // Kopf: Name + lateinischer Name links, Status-Schild + Chevron rechts.
    // Der Kopf ist (am Handy) anklickbar und klappt die Karte auf/zu.
    var kopf = $('<div class="sz-card-kopf"></div>');
    var namensBlock = '<div class="sz-namensblock"><span class="sz-name">'
        + gattung.designation + '</span>';
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

    // Aufklappbarer Inhalt (Felder + Speichern).
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
    feld.val(gattung.huntingSeason ? gattung.huntingSeason : '');
    body.append(feld);

    var speichern = $('<button type="button" class="sz-save" disabled>'
        + '<i class="bi bi-check2"></i> Gespeichert</button>');
    speichern.click(function() {
        speichereGattung(gattung.id, karte);
    });
    body.append(speichern);

    // Sobald etwas geaendert wird: Knopf aktiv schalten.
    function alsGeaendertMarkieren() {
        karte.addClass('sz-dirty');
        speichern.prop('disabled', false).html('<i class="bi bi-save"></i> Speichern');
    }
    schutzAuswahl.on('change', alsGeaendertMarkieren);
    feld.on('input', alsGeaendertMarkieren);

    karte.append(body);
    return karte;
}


// Filtert die Karten nach Suchtext (Name). Leere Gruppen werden mit
// ausgeblendet. Bestehende (auch unsaved) Karten bleiben erhalten.
function filtereKarten(text) {
    var suche = (text || '').trim().toLowerCase();

    $('.sz-card').each(function() {
        var treffer = $(this).attr('data-such').indexOf(suche) !== -1;
        $(this).toggle(suche === '' || treffer);
    });

    // ganzen Gruppen-Block ausblenden, wenn keine Karte sichtbar ist.
    $('#genusCards .sz-gruppe-block').each(function() {
        var sichtbar = $(this).find('.sz-card:visible').length > 0;
        $(this).toggle(sichtbar);
    });
}


// Speichert die Aenderungen einer Gattung per PUT /genus/{id}.
// Kein Neuaufbau, kein Popup: nach Erfolg wird nur die betroffene Karte
// aktualisiert (Status-Schild + ruhiger "Gespeichert"-Knopf).
function speichereGattung(id, karte) {

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
        'protectedSpecies' : karte.find('.schutzStatus').val() === 'ja',
        'huntingSeason'    : karte.find('.jagdZeit').val()
    };

    putJson('/genus/' + id, geaendert, function() {
        original.protectedSpecies = geaendert.protectedSpecies;
        original.huntingSeason = geaendert.huntingSeason;

        // Status-Schild neu setzen (Farbe kann sich geaendert haben).
        karte.find('.sz-badge-wrap').html(statusBadge(original));

        // Karte als gespeichert markieren: Knopf wieder ruhig stellen.
        karte.removeClass('sz-dirty');
        var btn = karte.find('.sz-save');
        btn.prop('disabled', true).html('<i class="bi bi-check2-circle"></i> Gespeichert');
    });
}
