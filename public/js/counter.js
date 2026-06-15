// counter.js
// Counter-Seite (AP12): Zaehlungen anlegen und hoch-/runterzaehlen.
// Die Counter liegen im Backend (GET/POST/PUT/DELETE /counters), damit die
// Zahlen echt gespeichert bleiben - auch nach Reload und nach einem Neustart.

// maximale Anzahl Counter laut Anforderung
var MAX_COUNTER = 4;

// hier merken wir uns die geladenen Counter aus dem Backend
var alleCounter = [];

// id des gerade aktiven Counters (zuletzt angeklickt). Die Pfeiltasten wirken
// auf diesen Counter. null bedeutet: es ist noch keiner ausgewaehlt.
var aktiveCounterId = null;


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Counter aus dem Backend laden und anzeigen.
    ladeCounter();

    // 2) Formular: neuen Counter anlegen.
    $('#newCounter').submit(function(event) {
        event.preventDefault();
        erstelleCounter();
    });

    // 3) "Zaehlung loeschen": alle Counter wieder auf 0 setzen.
    $('#zaehlungLoeschen').click(function() {
        setzeAlleAufNull();
    });

    // 4) Pfeiltasten abfangen: hoch zaehlt +1, runter -1 (am aktiven Counter).
    //    preventDefault verhindert, dass die Seite dabei scrollt.
    $(document).keydown(function(event) {
        // im Namensfeld sollen die Pfeiltasten normal funktionieren
        if ($(event.target).is('input')) {
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            zaehle(aktiveCounterId, 1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            zaehle(aktiveCounterId, -1);
        }
    });
});


// Laedt alle Counter (GET /counters) und zeichnet sie neu.
function ladeCounter() {
    $.ajax({
        type: 'GET',
        url: '/counters',
        success: function(data) {
            alleCounter = data;
            zeigeCounter();
        },
        error: function(xhr, status, error) {
            console.log('Counter konnten nicht geladen werden: ' + error);
        }
    });
}


// Baut die Anzeige der Counter neu auf.
function zeigeCounter() {
    var liste = $('#counterListe');
    liste.empty();

    $.each(alleCounter, function(index, counter) {

        // eine Karte pro Counter
        var karte = $('<div class="counter-karte"></div>');

        // den aktiven Counter (zuletzt angeklickt) hervorheben
        if (counter.id === aktiveCounterId) {
            karte.addClass('aktiv');
        }

        // Inhalt: Name und aktueller Zaehlerstand
        // Feld heisst counterValue (nicht value), weil VALUE ein SQL-Schluesselwort ist.
        karte.append('<div class="counter-name">' + counter.name + '</div>');
        karte.append('<div class="counter-wert">' + counter.counterValue + '</div>');

        // Knoepfe zum hoch-/runterzaehlen und loeschen (auch ohne Tastatur nutzbar)
        var hoch = $('<button type="button">+</button>');
        var runter = $('<button type="button">-</button>');
        var weg = $('<button type="button">Löschen</button>');

        hoch.click(function(event) {
            event.stopPropagation();   // nicht zusaetzlich die Karte aktiv klicken
            zaehle(counter.id, 1);
        });
        runter.click(function(event) {
            event.stopPropagation();
            zaehle(counter.id, -1);
        });
        weg.click(function(event) {
            event.stopPropagation();
            loescheCounter(counter.id);
        });

        karte.append(hoch);
        karte.append(runter);
        karte.append(weg);

        // Klick auf die Karte macht diesen Counter aktiv (fuer die Pfeiltasten)
        karte.click(function() {
            aktiveCounterId = counter.id;
            zeigeCounter();
        });

        liste.append(karte);
    });

    // Erstellen-Knopf sperren, wenn das Maximum erreicht ist.
    pruefeMaximum();
}


// Sperrt den Erstellen-Knopf und zeigt einen Hinweis, wenn schon 4 Counter da sind.
function pruefeMaximum() {
    if (alleCounter.length >= MAX_COUNTER) {
        $('#erstellenButton').prop('disabled', true);
        $('#maxHinweis').show();
    } else {
        $('#erstellenButton').prop('disabled', false);
        $('#maxHinweis').hide();
    }
}


// Legt einen neuen Counter an (POST /counters) mit Startwert 0.
function erstelleCounter() {

    // nicht mehr als 4 Counter zulassen
    if (alleCounter.length >= MAX_COUNTER) {
        return;
    }

    var name = $('#counterName').val();
    if (!name) {
        alert('Bitte einen Namen für die Zählung eingeben.');
        return;
    }

    var neuerCounter = {
        'name'         : name,
        'counterValue' : 0
    };

    postJson('/counters', neuerCounter, function() {
        $('#counterName').val('');   // Eingabefeld leeren
        ladeCounter();               // Liste neu laden
    });
}


// Zaehlt einen Counter um delta (+1 oder -1) und speichert das per PUT.
function zaehle(id, delta) {

    // ohne aktiven/uebergebenen Counter passiert nichts
    if (id === null) {
        return;
    }

    // den passenden Counter in der gemerkten Liste suchen
    $.each(alleCounter, function(index, counter) {
        if (counter.id === id) {

            var neuerWert = counter.counterValue + delta;

            var geaendert = {
                'name'         : counter.name,
                'counterValue' : neuerWert
            };

            putJson('/counters/' + id, geaendert, function() {
                ladeCounter();
            });
        }
    });
}


// Setzt alle Counter wieder auf 0 (die Counter selbst bleiben bestehen).
function setzeAlleAufNull() {
    $.each(alleCounter, function(index, counter) {
        var geaendert = {
            'name'         : counter.name,
            'counterValue' : 0
        };
        putJson('/counters/' + counter.id, geaendert, function() {
            ladeCounter();
        });
    });
}


// Loescht einen Counter ganz (DELETE /counters/{id}).
function loescheCounter(id) {
    deleteJson('/counters/' + id, function() {
        // war der geloeschte Counter aktiv, Auswahl zuruecksetzen
        if (aktiveCounterId === id) {
            aktiveCounterId = null;
        }
        ladeCounter();
    });
}
