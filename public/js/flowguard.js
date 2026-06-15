// flowguard.js
// Schuetzt den Anlage-Ablauf (Tiersichtung anlegen: Schritt 1 Tier, Schritt 2 Ort).
//
// Das Tier wird erst beim Abschluss in Schritt 2 gespeichert. Solange leben die
// Eingaben nur als Zwischenstand im sessionStorage. Deshalb:
//  - Wechsel ZWISCHEN den beiden Schritten (tier.html <-> ort.html): erlaubt,
//    keine Warnung, nichts geht verloren.
//  - Verlassen des Ablaufs (Startseite oder andere Seite): Warnung, weil das
//    noch nicht gespeicherte Tier dann verloren geht.

$(document).ready(function() {

    // Die beiden Seiten des Ablaufs. Ein Klick auf einen Link dorthin ist nur
    // ein Schrittwechsel und loest keine Warnung aus.
    var flowSeiten = ['tier.html', 'ort.html'];

    // Delegiert, damit auch die per nav.js erzeugten Stepper-Links und der
    // Titel-Link erfasst werden.
    $(document).on('click', 'nav a, a.titel-link', function(event) {

        var ziel = this.getAttribute('href') || '';
        var zielSeite = ziel.substring(ziel.lastIndexOf('/') + 1);

        // Wechsel zwischen Schritt 1 und Schritt 2: durchlassen.
        if (flowSeiten.indexOf(zielSeite) !== -1) {
            return;
        }

        // Sonst wird der Ablauf verlassen. Nur warnen, wenn schon etwas
        // eingegeben wurde.
        if (entwurfHatDaten()) {
            var ok = confirm(
                'Die Sichtung ist noch nicht gespeichert. Wenn du den Ablauf jetzt ' +
                'verlaesst, gehen die Angaben zu Tier und Ort verloren.\n\n' +
                'Zum Speichern bitte Schritt 2 (Ort) mit "Weiter" abschliessen.\n\n' +
                'Trotzdem verlassen?');

            if (!ok) {
                event.preventDefault();   // auf der Seite bleiben
            } else {
                // Der Nutzer verlaesst den Ablauf bewusst -> Zwischenstand
                // verwerfen, damit es beim naechsten Mal sauber leer beginnt.
                // Auch das Counter-Herkunft-Flag loeschen, sonst wuerde eine
                // spaetere normale Sichtung faelschlich zum Counter zurueckfuehren.
                sessionStorage.removeItem('tierEntwurf');
                sessionStorage.removeItem('ortEntwurf');
                sessionStorage.removeItem('counterHerkunftId');
            }
        }
    });
});


// Prueft, ob im Ablauf schon etwas eingegeben wurde: entweder im aktuellen
// Formular oder als Zwischenstand des jeweils anderen Schritts.
function entwurfHatDaten() {

    // 1) Eingaben im aktuellen Formularbereich (section).
    if (aktuellesFormularHatDaten()) {
        return true;
    }

    // 2) Zwischenstand aus Schritt 1 (Tier).
    if (entwurfNichtLeer('tierEntwurf',
            ['genus', 'gender', 'animalCount', 'estimatedSize', 'estimatedWeight',
             'sonstigeDesignation', 'sonstigeLatin', 'sonstigeHuntingSeason'])) {
        return true;
    }

    // 3) Zwischenstand aus Schritt 2 (Ort).
    if (entwurfNichtLeer('ortEntwurf',
            ['shorttitle', 'description', 'latitude', 'longitude', 'locationSelect', 'reporter'])) {
        return true;
    }

    return false;
}


// Prueft die sichtbaren Formularfelder der aktuellen Seite.
function aktuellesFormularHatDaten() {
    var daten = false;

    $('section input, section textarea').each(function() {
        var typ = (this.type || '').toLowerCase();
        if (typ === 'submit' || typ === 'button' || typ === 'checkbox' || typ === 'hidden') {
            return;
        }
        if (this.value !== null && this.value !== '') {
            daten = true;
        }
    });

    // Dropdowns: selectedIndex 0 ist die Standard-Option (keine echte Eingabe).
    $('section select').each(function() {
        if (this.selectedIndex > 0) {
            daten = true;
        }
    });

    return daten;
}


// Prueft, ob in einem gespeicherten Entwurf eines der genannten Felder einen
// echten (nicht leeren) Wert hat.
function entwurfNichtLeer(schluessel, felder) {
    var roh = sessionStorage.getItem(schluessel);
    if (!roh) {
        return false;
    }

    var obj;
    try {
        obj = JSON.parse(roh);
    } catch (e) {
        return false;
    }
    if (!obj) {
        return false;
    }

    for (var i = 0; i < felder.length; i++) {
        var wert = obj[felder[i]];
        if (wert !== undefined && wert !== null && ('' + wert).trim() !== '') {
            return true;
        }
    }
    return false;
}
