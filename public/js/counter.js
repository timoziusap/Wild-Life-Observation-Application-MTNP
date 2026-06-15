// counter.js
// Counter-Seite (AP12): Zaehlungen pro Gattung anlegen und hoch-/runterzaehlen.
// Die Counter liegen im Backend (GET/POST/PUT/DELETE /counters), damit die
// Zahlen echt gespeichert bleiben - auch nach Reload und nach einem Neustart.
//
// Neu: Statt eines freien Namens waehlt man beim Anlegen eine Gattung (wie bei
// Tier anlegen). Ueber "Sonstige" kann man eine neue Gattung anlegen, die
// dauerhaft in der Datenbank gespeichert wird. Pro Counter gibt es einen Knopf
// "Tiersichtung eintragen", der Gattung und Anzahl ins Tier-Formular uebernimmt.

// hoechstens so viele Counter gleichzeitig (bewusst hoch gewaehlt, kein Hinweis-Text).
var MAX_COUNTER = 15;

// hier merken wir uns die geladenen Counter und Gattungen aus dem Backend
var alleCounter = [];
var alleGattungen = [];

// id des gerade aktiven Counters (zuletzt angeklickt). Die Pfeiltasten wirken
// auf diesen Counter. null bedeutet: es ist noch keiner ausgewaehlt.
var aktiveCounterId = null;


// Wird ausgefuehrt, sobald die Seite fertig geladen ist.
$(document).ready(function() {

    // 1) Gattungen fuer das Dropdown laden (GET /genus).
    ladeGattungen();

    // 2) Counter aus dem Backend laden und anzeigen.
    ladeCounter();

    // 3) Formular: neuen Counter anlegen.
    $('#newCounter').submit(function(event) {
        event.preventDefault();
        erstelleCounter();
    });

    // 3b) "Sonstige" gewaehlt -> Felder fuer die neue Gattung einblenden.
    $('#counterGenusSelect').change(function() {
        if ($('#counterGenusSelect').val() === 'sonstige') {
            $('#counterSonstigeBereich').show();
        } else {
            $('#counterSonstigeBereich').hide();
        }
    });

    // 4) "Alle Zaehlungen auf 0 setzen".
    $('#zaehlungLoeschen').click(function() {
        setzeAlleAufNull();
    });

    // 4b) "Alle Zaehlungen loeschen".
    $('#alleLoeschen').click(function() {
        loescheAlle();
    });

    // 5) Pfeiltasten abfangen: hoch zaehlt +1, runter -1 (am aktiven Counter).
    $(document).keydown(function(event) {
        // in Eingabefeldern sollen die Pfeiltasten normal funktionieren
        if ($(event.target).is('input, select')) {
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


// Laedt die Gattungen vom Backend und fuellt das Dropdown.
function ladeGattungen() {
    $.ajax({
        type: 'GET',
        url: '/genus',
        success: function(data) {
            alleGattungen = data;
            var select = $('#counterGenusSelect');
            $.each(data, function(index, gattung) {
                var option = $('<option></option>');
                option.val(gattung.id);
                option.text(gattung.designation);
                // "Sonstige" soll immer die letzte Option bleiben
                option.insertBefore(select.find('option[value="sonstige"]'));
            });
        },
        error: function(xhr, status, error) {
            console.log('Gattungen konnten nicht geladen werden: ' + error);
        }
    });
}


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

        // Name = Gattungsbezeichnung (Fallback: alter Name oder "Zaehlung").
        var bezeichnung = 'Zählung';
        if (counter.genus && counter.genus.designation) {
            bezeichnung = counter.genus.designation;
        } else if (counter.name) {
            bezeichnung = counter.name;
        }
        karte.append('<div class="counter-name">' + bezeichnung + '</div>');

        // Zaehlerstand als Eingabefeld.
        var wertFeld = $('<input type="text" class="counter-wert">');
        wertFeld.val(counter.counterValue);
        wertFeld.click(function(event) {
            event.stopPropagation();
        });
        wertFeld.keydown(function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                setzeWert(counter.id, wertFeld.val());
            }
        });
        karte.append(wertFeld);

        // Knoepfe zum hoch-/runterzaehlen und loeschen.
        var hoch = $('<button type="button" class="counter-pm">+</button>');
        var runter = $('<button type="button" class="counter-pm">-</button>');
        var weg = $('<button type="button">Löschen</button>');

        hoch.click(function(event) {
            event.stopPropagation();
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

        karte.append(runter);
        karte.append(weg);
        karte.append(hoch);

        // Knopf, der die Zaehlung als Tiersichtung uebernimmt.
        var eintragen = $('<button type="button" class="eintragen-btn">Tiersichtung eintragen</button>');
        eintragen.click(function(event) {
            event.stopPropagation();
            tiersichtungEintragen(counter);
        });
        karte.append(eintragen);

        // Klick auf die Karte macht diesen Counter aktiv (fuer die Pfeiltasten)
        karte.click(function() {
            aktiveCounterId = counter.id;
            zeigeCounter();
        });

        liste.append(karte);
    });

    // Erstellen-Knopf sperren, wenn das Maximum erreicht ist (ohne Hinweis-Text).
    pruefeMaximum();
}


// Sperrt den Erstellen-Knopf, wenn schon MAX_COUNTER Counter da sind.
function pruefeMaximum() {
    $('#erstellenButton').prop('disabled', alleCounter.length >= MAX_COUNTER);
}


// Legt einen neuen Counter an. Bei "Sonstige" wird zuerst die neue Gattung
// dauerhaft gespeichert (POST /genus), danach der Counter damit angelegt.
function erstelleCounter() {

    if (alleCounter.length >= MAX_COUNTER) {
        alert('Es sind schon ' + MAX_COUNTER + ' Zählungen angelegt. Bitte zuerst eine löschen.');
        return;
    }

    var auswahl = $('#counterGenusSelect').val();
    if (!auswahl) {
        alert('Bitte eine Gattung auswählen.');
        return;
    }

    if (auswahl === 'sonstige') {
        // neue Gattung zuerst anlegen, dann den Counter damit erstellen.
        var bezeichnung = $('#counterSonstigeDesignation').val();
        if (!bezeichnung) {
            alert('Bitte eine Bezeichnung für die neue Gattung eingeben.');
            return;
        }

        var neueGattung = {
            'designation'      : bezeichnung,
            'latinDesignation' : $('#counterSonstigeLatin').val(),
            'protectedSpecies' : $('#counterSonstigeProtected').val() === 'ja',
            'huntingSeason'    : $('#counterSonstigeHuntingSeason').val()
        };

        postJson('/genus', neueGattung, function(gattung) {
            speichereCounter(gattung.id);
        });

    } else {
        speichereCounter(auswahl);
    }
}


// Speichert einen neuen Counter mit Startwert 0 fuer die uebergebene Gattung.
function speichereCounter(genusId) {
    var neuerCounter = {
        'genus'        : { 'id': genusId },
        'counterValue' : 0
    };

    postJson('/counters', neuerCounter, function() {
        // Formular zuruecksetzen und Liste neu laden.
        $('#newCounter')[0].reset();
        $('#counterSonstigeBereich').hide();
        ladeCounter();
    });
}


// Baut die Daten fuer einen PUT zusammen. WICHTIG: die Gattung muss mit, sonst
// wuerde das Backend die Zuordnung beim Speichern auf null setzen.
function counterPayload(counter, neuerWert) {
    var daten = { 'counterValue': neuerWert };
    if (counter.genus && counter.genus.id != null) {
        daten.genus = { 'id': counter.genus.id };
    }
    return daten;
}


// Zaehlt einen Counter um delta (+1 oder -1) und speichert das per PUT.
function zaehle(id, delta) {

    if (id === null) {
        return;
    }

    $.each(alleCounter, function(index, counter) {
        if (counter.id === id) {

            var neuerWert = counter.counterValue + delta;
            if (neuerWert < 0) {
                return;   // nicht unter 0
            }

            putJson('/counters/' + id, counterPayload(counter, neuerWert), function() {
                ladeCounter();
            });
        }
    });
}


// Setzt den Zaehlerstand eines Counters auf eine selbst eingegebene Zahl.
function setzeWert(id, eingabe) {

    var text = $.trim(eingabe);

    if (!/^\d+$/.test(text)) {
        alert('Bitte eine ganze Zahl (0 oder größer) eingeben.');
        return;
    }

    var wert = parseInt(text, 10);

    $.each(alleCounter, function(index, counter) {
        if (counter.id === id) {
            putJson('/counters/' + id, counterPayload(counter, wert), function() {
                ladeCounter();
            });
        }
    });
}


// Setzt alle Counter wieder auf 0 (die Counter selbst bleiben bestehen).
function setzeAlleAufNull() {

    // Sicherheitsabfrage, damit man nicht aus Versehen alles auf 0 setzt.
    if (!confirm('Möchtest du wirklich alle Zählungen auf 0 setzen?')) {
        return;
    }

    $.each(alleCounter, function(index, counter) {
        putJson('/counters/' + counter.id, counterPayload(counter, 0), function() {
            ladeCounter();
        });
    });
}


// Loescht alle Counter komplett (DELETE /counters/{id} fuer jeden).
function loescheAlle() {

    // Sicherheitsabfrage: das Loeschen kann nicht rueckgaengig gemacht werden.
    if (!confirm('Wirklich alle Zählungen löschen? Das kann nicht rückgängig gemacht werden.')) {
        return;
    }

    $.each(alleCounter, function(index, counter) {
        deleteJson('/counters/' + counter.id, function() {
            ladeCounter();
        });
    });
    aktiveCounterId = null;
}


// Loescht einen Counter ganz (DELETE /counters/{id}).
function loescheCounter(id) {

    // Bezeichnung fuer die Rueckfrage heraussuchen.
    var bezeichnung = '';
    $.each(alleCounter, function(index, counter) {
        if (counter.id === id) {
            if (counter.genus && counter.genus.designation) {
                bezeichnung = counter.genus.designation;
            } else if (counter.name) {
                bezeichnung = counter.name;
            }
        }
    });

    // Sicherheitsabfrage, damit nicht aus Versehen geloescht wird.
    if (!confirm('Zählung "' + bezeichnung + '" wirklich löschen?')) {
        return;
    }

    deleteJson('/counters/' + id, function() {
        if (aktiveCounterId === id) {
            aktiveCounterId = null;
        }
        ladeCounter();
    });
}


// Uebernimmt eine Zaehlung als Tiersichtung: Gattung und Anzahl werden im
// Tier-Formular (Schritt 1) vorausgefuellt. Nach dem Speichern der Sichtung
// kommt man zurueck und dieser Counter wird entfernt (siehe ort.js).
function tiersichtungEintragen(counter) {

    if (!counter.genus || counter.genus.id == null) {
        alert('Diese Zählung hat keine Gattung und kann nicht übernommen werden.');
        return;
    }
    if (!counter.counterValue || counter.counterValue < 1) {
        alert('Der Zähler steht auf 0. Bitte zuerst Tiere zählen.');
        return;
    }

    // kurze Info, was jetzt passiert.
    var info = 'Gattung "' + counter.genus.designation + '" mit Anzahl ' + counter.counterValue
             + ' ins Tier-Formular übernehmen?\n'
             + 'Nach dem Speichern der Sichtung kommst du zurück und diese Zählung wird entfernt.';
    if (!confirm(info)) {
        return;
    }

    // Schritt 1 (Tier) vorausfuellen, Ort-Entwurf frisch starten.
    var tierEntwurf = {
        'genus'      : String(counter.genus.id),
        'animalCount': String(counter.counterValue)
    };
    sessionStorage.setItem('tierEntwurf', JSON.stringify(tierEntwurf));
    sessionStorage.removeItem('ortEntwurf');

    // merken, dass die Sichtung aus diesem Counter kommt (zum spaeteren Loeschen).
    sessionStorage.setItem('counterHerkunftId', counter.id);

    window.location.href = 'tier.html';
}
