// search.js
// Dialog 4: Suche und Filter ueber alle Beobachtungen.
// Baut aus den Filterfeldern die URL fuer GET /observations/search
// zusammen und zeigt die Treffer in der Ergebnis-Tabelle an.


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
        sucheObservations();
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
                            return "geschuetzt";
                        }
                        return "nicht geschuetzt";
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
