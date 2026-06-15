// flowguard.js
// Schuetzt den Anlage-Ablauf (Tiersichtung anlegen: Tier -> Ort).
// Wer die Seite ueber die Navigation verlaesst und schon Daten eingegeben
// hat, muss den Abbruch erst bestaetigen. Erst nach Bestaetigung geht es zur
// Zielseite, sonst bleibt man auf der Seite.

$(document).ready(function() {
    // Klick auf einen Navigationslink abfangen.
    $('nav a').on('click', function(event) {
        if (formHatDaten()) {
            var ok = confirm('Anlage wirklich abbrechen? Bereits eingegebene Daten gehen verloren.');
            if (!ok) {
                event.preventDefault();   // auf der Seite bleiben
            }
        }
    });
});

// Prueft, ob im Formularbereich (section) schon etwas eingetragen wurde.
function formHatDaten() {
    var daten = false;

    // Textfelder und Zahlenfelder: gefuellt = Eingabe vorhanden.
    $('section input, section textarea').each(function() {
        var typ = (this.type || '').toLowerCase();
        if (typ === 'submit' || typ === 'button' || typ === 'checkbox' || typ === 'hidden') {
            return;
        }
        if (this.value !== null && this.value !== '') {
            daten = true;
        }
    });

    // Dropdowns: selectedIndex 0 ist die Standard-Option ("-- bitte waehlen --"
    // bzw. der Vorgabewert). Erst eine andere Auswahl zaehlt als Eingabe.
    $('section select').each(function() {
        if (this.selectedIndex > 0) {
            daten = true;
        }
    });

    return daten;
}
