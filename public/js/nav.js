// nav.js
// Gemeinsame Navigation fuer alle Seiten (ohne jQuery, damit es auch
// auf der Startseite laeuft).
//
// Normale Seiten bekommen ein Aufklapp-Menue ("Menü ▾"):
//  - die anderen Seiten sind anklickbar,
//  - die aktuelle Seite steht im Menue, ist aber ausgegraut,
//  - "Startseite" gibt es nicht als Eintrag: ein Klick auf den Titel (Header)
//    fuehrt zur Startseite.
//
// Die zwei Seiten des Anlage-Ablaufs (tier.html, ort.html) bekommen statt
// des Menues einen Fortschrittsbalken (Stepper) mit Schritt 1 (Tier) und
// Schritt 2 (Ort). So sieht man, wo man gerade steht, und kann zwischen den
// beiden Schritten hin- und herwechseln.

document.addEventListener('DOMContentLoaded', function() {

    // Seiten im normalen Menue (ohne Startseite).
    var seiten = [
        { href: 'tier.html',         text: 'Tiersichtung anlegen' },
        { href: 'search.html',       text: 'Tiersichtung suchen' },
        { href: 'counter.html',      text: 'Counter' },
        { href: 'schutzzeiten.html', text: 'Schutzzeiten' }
    ];

    // aktuelle Seite aus der URL bestimmen (letzter Teil des Pfads).
    var pfad = window.location.pathname;
    var aktuell = pfad.substring(pfad.lastIndexOf('/') + 1);
    if (aktuell === '') {
        aktuell = 'index.html';
    }

    // Seiten, die zum Ablauf "Tiersichtung anlegen" gehoeren.
    var flowSeiten = ['tier.html', 'ort.html'];
    var imFlow = flowSeiten.indexOf(aktuell) !== -1;

    var nav = document.querySelector('nav');
    if (nav && imFlow) {
        // Im Anlage-Ablauf: Fortschrittsbalken statt Menue.
        nav.classList.add('top-stepper-nav');
        nav.innerHTML = baueStepper(aktuell);

    } else if (nav) {
        // Normale Seite: Aufklapp-Menue. Auf dem Handy wird diese Leiste
        // ausgeblendet, weil dort die untere Symbolleiste die Navigation uebernimmt.
        nav.classList.add('top-menu-nav');
        var eintraege = '';
        seiten.forEach(function(s) {
            if (s.href === aktuell) {
                // aktuelle Seite: anzeigen, aber ausgegraut und nicht klickbar
                eintraege += '<span class="menu-eintrag aktuell">' + s.text + '</span>';
            } else {
                eintraege += '<a class="menu-eintrag" href="' + s.href + '">' + s.text + '</a>';
            }
        });

        nav.innerHTML =
            '<div class="menu-wrap">' +
            '<button type="button" class="menu-button" id="menuButton">Menü ▾</button>' +
            '<div class="menu-panel" id="menuPanel">' + eintraege + '</div>' +
            '</div>';

        var button = document.getElementById('menuButton');
        var panel = document.getElementById('menuPanel');

        // Auf-/Zuklappen.
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            panel.classList.toggle('offen');
        });
        // Klick irgendwo anders schliesst das Menue.
        document.addEventListener('click', function() {
            panel.classList.remove('offen');
        });
        // Klick im Menue selbst soll es nicht sofort schliessen.
        panel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Titel im Header zur Startseite verlinken (ersetzt den Startseite-Knopf).
    var h1 = document.querySelector('header h1');
    if (h1 && !h1.closest('a')) {
        var link = document.createElement('a');
        link.href = 'index.html';
        link.className = 'titel-link';
        h1.parentNode.insertBefore(link, h1);
        link.appendChild(h1);
    }
});


// Baut den Fortschrittsbalken fuer den Anlage-Ablauf.
// aktuell = 'tier.html' (Schritt 1) oder 'ort.html' (Schritt 2).
function baueStepper(aktuell) {

    // Grundklassen; je nach aktueller Seite kommt "aktiv"/"erledigt" dazu.
    var s1 = 'stepper-schritt';
    var s2 = 'stepper-schritt';

    if (aktuell === 'tier.html') {
        s1 += ' aktiv';
    }
    if (aktuell === 'ort.html') {
        s1 += ' erledigt';   // Schritt 1 liegt hinter uns
        s2 += ' aktiv';
    }

    return '' +
        '<div class="stepper">' +
            '<a class="' + s1 + '" href="tier.html">' +
                '<span class="stepper-nr">1</span> Tier anlegen</a>' +
            '<span class="stepper-pfeil">&rsaquo;</span>' +
            '<a class="' + s2 + '" href="ort.html">' +
                '<span class="stepper-nr">2</span> Ort anlegen</a>' +
            '<a class="stepper-exit" href="index.html">Abbrechen</a>' +
        '</div>';
}
