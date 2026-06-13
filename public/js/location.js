// location.js - Dialog 2: Beobachtungsort anlegen
// Aufbau wie im VideoArchive (jQuery + $.ajax + DataTables)
// Passt zur index.html von Niclas (Formular #newLocation, Tabelle #locationTable)

// Merkt sich die lNr des Ortes, der gerade bearbeitet wird.
// 0 = neuen Ort anlegen, groesser 0 = vorhandenen aendern.
var bearbeiteLnr = 0;

// Wird aufgerufen sobald die Seite geladen ist
$(document).ready(function() {
    addLocationListeners();
    loadLocations();
});

// Event Listener registrieren
function addLocationListeners() {
    // Formular absenden -> neue Location anlegen
    $('#newLocation').submit(function(event) {
        event.preventDefault();
        addLocation();
    });

    // "Laden"-Button -> Tabelle neu befuellen
    $('#loadLocationTable').click(function(event) {
        loadLocations();
    });
}

// Location speichern. Je nach bearbeiteLnr wird angelegt (POST) oder geaendert (PUT).
function addLocation() {
    var formData = {
        'shorttitle':  $('[name=shorttitle]').val(),
        'description': $('[name=description]').val(),
        'latitude':    $('[name=latitude]').val(),
        'longitude':   $('[name=longitude]').val()
    };

    // Bei Bearbeitung geht der Request an /locations/{lNr} per PUT
    var methode = 'POST';
    var url = '/locations';
    if (bearbeiteLnr !== 0) {
        methode = 'PUT';
        url = '/locations/' + bearbeiteLnr;
    }

    $.ajax({
        type: methode,
        url: url,
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(data) {
            // Formular leeren, zurueck in den "Neu"-Modus, Tabelle neu laden
            bearbeiteLnr = 0;
            $('#newLocation')[0].reset();
            $('#newLocationButton').val('Ort speichern');
            loadLocations();
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Speichern der Location: ' + error);
        }
    });
}

// Schreibt die Daten eines Ortes zurueck ins Formular, damit man sie aendern kann.
function bearbeiteLocation(lNr, shorttitle, description, latitude, longitude) {
    bearbeiteLnr = lNr;
    $('[name=shorttitle]').val(shorttitle);
    $('[name=description]').val(description);
    $('[name=latitude]').val(latitude);
    $('[name=longitude]').val(longitude);
    $('#newLocationButton').val('Aenderung speichern');
}

// Loescht einen Ort nach Rueckfrage (DELETE /locations/{lNr}).
function loescheLocation(lNr) {
    if (confirm('Diesen Ort wirklich löschen?')) {
        $.ajax({
            type: 'DELETE',
            url: '/locations/' + lNr,
            success: function() {
                loadLocations();
            },
            error: function(xhr, status, error) {
                alert('Fehler beim Löschen der Location: ' + error);
            }
        });
    }
}

// Alle Locations laden und Tabelle befuellen
// Spalten genau wie in der index.html: LNr, Kurztitel, Beschreibung, Latitude, Longitude
function loadLocations() {
    $.ajax({
        type: 'GET',
        url: '/locations',
        success: function(data) {
            var table = $('#locationTable').DataTable();
            table.clear();
            $.each(data, function(index, location) {

                // Aktions-Buttons (Bearbeiten + Loeschen), wie bei den Tieren
                var bearbeitenBtn =
                    '<button onclick="bearbeiteLocation(' +
                    location.lNr + ',' +
                    '\'' + location.shorttitle + '\',' +
                    '\'' + location.description + '\',' +
                    '\'' + location.latitude + '\',' +
                    '\'' + location.longitude + '\'' +
                    ')">Bearbeiten</button>';

                var loeschenBtn =
                    '<button onclick="loescheLocation(' + location.lNr + ')">Löschen</button>';

                table.row.add([
                    location.lNr,
                    location.shorttitle,
                    location.description,
                    location.latitude,
                    location.longitude,
                    bearbeitenBtn + ' ' + loeschenBtn
                ]);
            });
            table.draw();
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Laden der Locations: ' + error);
        }
    });
}
