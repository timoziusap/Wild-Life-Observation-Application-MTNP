// search.js
// Dialog 4: Suche und Filter ueber alle Beobachtungen.
// Baut aus den Filterfeldern die URL fuer GET /observations/search
// zusammen und zeigt die Treffer in der Ergebnis-Tabelle an.
// AP11: Doppelklick auf eine Zeile oeffnet eine Detailansicht.


// AP11+: merkt sich die id der gerade angezeigten Sichtung (fuer Loeschen).
var aktuelleSichtungId = null;

// Karte und Marker fuer die Detailansicht.
var detailKarte = null;
var detailMarker = null;


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungs-Dropdown aus dem Backend fuellen (GET /genus).
    fillDropdown('/genus', 'searchGenus', 'designation', 'id');

    // 2) Ort-Dropdown fuellen (GET /locations). Wert ist die lNr.
    fillDropdown('/locations', 'searchLocation', 'shorttitle', 'lNr');

    // 3) Beim Laden der Seite einmal alle Beobachtungen anzeigen.
    sucheObservations();

    // 4) Formular absenden -> Suche mit den gesetzten Filtern ausfuehren.
    $('#searchForm').submit(function(event) {
        event.preventDefault();
        sucheObservations();
    });

    // 5) Zuruecksetzen -> alle Felder leeren und wieder alles anzeigen.
    $('#resetSearch').click(function() {
        $('#searchForm')[0].reset();
        $('#detailansicht').hide();   // Detailansicht mit zuruecksetzen
        sucheObservations();
    });

    // 6) AP11: Doppelklick auf eine Tabellenzeile zeigt die Detailansicht.
    //    Der Handler haengt am tbody (delegiert), damit er auch nach dem
    //    Neuaufbau der DataTable weiter funktioniert.
    $('#searchTable tbody').on('dblclick', 'tr', function() {
        var table = $('#searchTable').DataTable();
        var zeile = table.row(this).data();
        if (zeile) {
            zeigeDetails(zeile);
        }
    });

    // 7) Schliessen-Knopf der Detailansicht.
    $('#detailSchliessen').click(function() {
        $('#detailansicht').hide();
    });

    // 8) Loeschen-Knopf: erst nach Namensangabe und Bestaetigung loeschen.
    $('#detailLoeschen').click(function() {
        if (aktuelleSichtungId === null) {
            return;
        }
        // Wer loescht den Eintrag? (Pflichtangabe)
        var wer = prompt('Wer löscht diesen Eintrag? Bitte Namen angeben:');
        if (wer === null) {
            return;   // Abbruch
        }
        if (wer.trim() === '') {
            alert('Bitte angeben, wer den Eintrag löscht.');
            return;
        }
        // Zweite Bestaetigung, damit nichts aus Versehen geloescht wird.
        if (!confirm('Eintrag wirklich endgültig löschen? (gelöscht von: ' + wer + ')')) {
            return;
        }
        deleteJson('/observations/' + aktuelleSichtungId, function() {
            console.log('Sichtung ' + aktuelleSichtungId + ' geloescht von: ' + wer);
            alert('Eintrag wurde gelöscht (von ' + wer + ').');
            $('#detailansicht').hide();
            aktuelleSichtungId = null;
            sucheObservations();   // Tabelle neu laden
        });
    });
});


// Baut die Such-URL mit allen gesetzten Filtern zusammen.
// Leere Felder werden weggelassen - das Backend ignoriert fehlende Parameter.
function baueSuchUrl() {
    var parameter = [];

    if ($('#searchGenus').val()) {
        parameter.push('genusId=' + $('#searchGenus').val());
    }
    if ($('#searchGender').val()) {
        parameter.push('gender=' + $('#searchGender').val());
    }
    if ($('#searchMinCount').val()) {
        parameter.push('minCount=' + $('#searchMinCount').val());
    }
    if ($('#searchMinYoung').val()) {
        parameter.push('minYoungCount=' + $('#searchMinYoung').val());
    }
    if ($('#searchLocation').val()) {
        parameter.push('locationLnr=' + $('#searchLocation').val());
    }

    // Schutzstatus: "ja"/"nein" aus dem Dropdown in true/false uebersetzen.
    if ($('#searchProtected').val() === 'ja') {
        parameter.push('protectedSpecies=true');
    }
    if ($('#searchProtected').val() === 'nein') {
        parameter.push('protectedSpecies=false');
    }

    var url = '/observations/search';
    if (parameter.length > 0) {
        url = url + '?' + parameter.join('&');
    }
    return url;
}


// Fuehrt die Suche aus und laedt die Treffer in die DataTable.
// Die Spalten entsprechen Punkt 5 der Anforderung: die wichtigsten
// Infos sollen direkt im Suchergebnis sichtbar sein.
function sucheObservations() {
    $('#searchTable').DataTable({
        destroy: true,             // alte Tabelle vorher verwerfen
        responsive: true,          // auf dem Handy zu breite Spalten einklappen
        "ajax": {
            "url"     : baueSuchUrl(),
            "dataSrc" : "",        // flaches JSON-Array, kein Wrapper-Objekt
            "error"   : function(xhr, error, thrown) {
                console.log('Suchergebnisse konnten nicht geladen werden: ' + thrown);
            }
        },
        "columns": [
            // Tierart/Gattung (steckt verschachtelt im Tier).
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.genus && animal.genus.designation) {
                        return animal.genus.designation;
                    }
                    return "";
                }},
            // Anzahl der gesichteten Tiere.
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.animalCount != null) {
                        return animal.animalCount;
                    }
                    return "";
                }},
            // Geschlecht.
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.gender) {
                        return animal.gender;
                    }
                    return "";
                }},
            // Jungtiere: Anzahl anzeigen wenn welche gesichtet wurden, sonst "keine".
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.youngPresent) {
                        return animal.youngCount;
                    }
                    return "keine";
                }},
            // Schutzstatus der Gattung.
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.genus) {
                        if (animal.genus.protectedSpecies) {
                            return "geschützt";
                        }
                        return "nicht geschützt";
                    }
                    return "";
                }},
            // Jagdzeitraum bzw. Schutzbestimmung.
            { "data": "animal", "render": function(animal) {
                    if (animal && animal.genus && animal.genus.huntingSeason) {
                        return animal.genus.huntingSeason;
                    }
                    return "";
                }},
            // Sichtungsort (Kurztitel).
            { "data": "location", "render": function(location) {
                    if (location && location.shorttitle) {
                        return location.shorttitle;
                    }
                    return "";
                }},
            { "data": "date" },
            { "data": "time" }
        ]
    });
}


// AP11: Zeigt die Detailansicht zu einer angeklickten Beobachtung.
// beob ist das komplette Zeilen-Objekt aus der DataTable
// (eine Observation mit verschachteltem animal, genus und location).
function zeigeDetails(beob) {

    // id der Sichtung merken, damit der Loeschen-Knopf weiss, was er loescht.
    aktuelleSichtungId = (beob && beob.id != null) ? beob.id : null;

    // Verschachtelte Objekte sicher herausholen (koennen fehlen).
    var tier    = beob.animal   || {};
    var gattung = tier.genus    || {};
    var ort     = beob.location || {};

    // Jungtiere nur als Zahl, wenn welche gesichtet wurden.
    var jungtiere = 'keine';
    if (tier.youngPresent) {
        jungtiere = tier.youngCount;
    }

    // Ort: Kurztitel, dazu Beschreibung und Koordinaten falls vorhanden.
    var ortText = ort.shorttitle || 'unbekannt';
    if (ort.description) {
        ortText = ortText + ' - ' + ort.description;
    }
    var koordinaten = '';
    if (ort.latitude && ort.longitude) {
        koordinaten = ort.latitude + ', ' + ort.longitude;
    }

    // HTML fuer die Detailbox zusammenbauen.
    // reporter und createdAt kommen aus AP7; falls null -> "unbekannt".
    var html = '';
    html += '<p><strong>Sichtungsort:</strong> ' + ortText + '</p>';
    if (koordinaten) {
        html += '<p><strong>Koordinaten:</strong> ' + koordinaten + '</p>';
    }
    html += '<p><strong>Gattung:</strong> ' + (gattung.designation || 'unbekannt') + '</p>';
    html += '<p><strong>Geschlecht:</strong> ' + (tier.gender || 'unbekannt') + '</p>';
    html += '<p><strong>Anzahl der Tiere:</strong> '
          + (tier.animalCount != null ? tier.animalCount : 'unbekannt') + '</p>';
    html += '<p><strong>Jungtiere:</strong> ' + jungtiere + '</p>';
    html += '<p><strong>Datum der Sichtung:</strong> ' + (beob.date || 'unbekannt') + '</p>';
    html += '<p><strong>Uhrzeit der Sichtung:</strong> ' + (beob.time || 'unbekannt') + '</p>';
    html += '<p><strong>Erfasst von (Melder):</strong> ' + (beob.reporter || 'unbekannt') + '</p>';
    html += '<p><strong>Erfassungszeitpunkt:</strong> ' + (beob.createdAt || 'unbekannt') + '</p>';

    // Detailbox fuellen und einblenden.
    $('#detailInhalt').html(html);
    $('#detailansicht').show();

    // Sichtungsort auf der Karte anzeigen (genaue Koordinaten).
    zeigeOrtImDetail(ort);
}


// Zeigt den Sichtungsort als Karte mit Marker in der Detailansicht.
// Ohne Koordinaten wird die Karte ausgeblendet.
function zeigeOrtImDetail(ort) {
    if (!ort || !ort.latitude || !ort.longitude) {
        $('#detailMap').hide();
        return;
    }

    var lat = parseFloat(ort.latitude);
    var lng = parseFloat(ort.longitude);

    // erst sichtbar machen, dann Karte aufbauen/anpassen
    $('#detailMap').show();

    if (detailKarte === null) {
        detailKarte = L.map('detailMap').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(detailKarte);
    } else {
        detailKarte.setView([lat, lng], 15);
    }

    // alten Marker entfernen, neuen setzen
    if (detailMarker !== null) {
        detailKarte.removeLayer(detailMarker);
    }
    detailMarker = L.marker([lat, lng]).addTo(detailKarte);

    // Leaflet muss die Groesse neu berechnen, da die Karte vorher versteckt war.
    setTimeout(function() {
        detailKarte.invalidateSize();
        detailKarte.setView([lat, lng], 15);
    }, 100);
}
