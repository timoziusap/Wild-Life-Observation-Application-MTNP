// location.js - Dialog 2: Beobachtungsort anlegen
// Aufbau wie im VideoArchive (jQuery + $.ajax + DataTables)
// Passt zur index.html von Niclas (Formular #newLocation, Tabelle #locationTable)

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

// Neue Location per POST anlegen
function addLocation() {
    var formData = {
        'shorttitle':  $('[name=shorttitle]').val(),
        'description': $('[name=description]').val(),
        'latitude':    $('[name=latitude]').val(),
        'longitude':   $('[name=longitude]').val()
    };

    $.ajax({
        type: 'POST',
        url: '/locations',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(data) {
            // Formular leeren und Tabelle neu laden
            $('#newLocation')[0].reset();
            loadLocations();
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Anlegen der Location: ' + error);
        }
    });
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
                table.row.add([
                    location.lNr,
                    location.shorttitle,
                    location.description,
                    location.latitude,
                    location.longitude
                ]);
            });
            table.draw();
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Laden der Locations: ' + error);
        }
    });
}
