// nav.js
// Gemeinsame Navigation fuer alle Seiten (ohne jQuery, damit es auch
// auf der Startseite laeuft).
//
// Oben (am PC):
//  - Normale Seiten zeigen alle Menuepunkte direkt als Leiste (kein Dropdown mehr).
//  - Die aktuelle Seite ist ausgegraut und nicht klickbar.
//  - Die Startseite blendet die obere Leiste aus, dort navigieren die Kacheln.
//  - Die zwei Seiten des Anlage-Ablaufs (tier.html, ort.html) bekommen statt
//    der Leiste einen Fortschrittsbalken (Schritt 1 Tier, Schritt 2 Ort).
//
// Unten (auf dem Handy): auf allen Seiten eine feste Symbolleiste mit allen
// Punkten. Am PC ist sie ausgeblendet. Im Anlage-Ablauf warnt flowguard.js,
// wenn man ueber die Leiste den Ablauf verlaesst.

document.addEventListener('DOMContentLoaded', function() {

    // Alle Seiten mit Icon (Bootstrap Icons) und Kurztext fuer die Handy-Leiste.
    var seiten = [
        { href: 'index.html',        text: 'Startseite',           kurz: 'Start',     icon: 'bi-house' },
        { href: 'tier.html',         text: 'Tiersichtung anlegen', kurz: 'Anlegen',   icon: 'bi-binoculars' },
        { href: 'search.html',       text: 'Suchen',               kurz: 'Suchen',    icon: 'bi-search' },
        { href: 'counter.html',      text: 'Zählungen',            kurz: 'Zählung',   icon: 'bi-calculator' },
        { href: 'schutzzeiten.html', text: 'Schutzzeiten',         kurz: 'Schutz',    icon: 'bi-shield-check' }
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
        // Im Anlage-Ablauf: Fortschrittsbalken statt Leiste.
        nav.classList.add('top-stepper-nav');
        nav.innerHTML = baueStepper(aktuell);

    } else if (nav) {
        // Normale Seite: alle Punkte direkt als Leiste (kein Dropdown).
        // Die Startseite selbst lassen wir weg, dorthin fuehrt der Titel-Klick.
        nav.classList.add('top-menu-nav');
        var eintraege = '';
        seiten.forEach(function(s) {
            if (s.href === 'index.html') {
                return;
            }
            if (s.href === aktuell) {
                // aktuelle Seite: anzeigen, aber ausgegraut und nicht klickbar
                eintraege += '<span class="aktuell">' + s.text + '</span>';
            } else {
                eintraege += '<a href="' + s.href + '">' + s.text + '</a>';
            }
        });
        nav.innerHTML = '<div class="top-links">' + eintraege + '</div>';
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

    // Untere Handy-Leiste auf jeder Seite einbauen.
    baueUntereLeiste(seiten, aktuell, imFlow);
});


// Baut die feste untere Symbolleiste fuers Handy (auf allen Seiten).
// Sie ist ein <nav>, damit flowguard.js (Selektor "nav a") die Klicks im
// Anlage-Ablauf mitbekommt und ggf. warnt.
function baueUntereLeiste(seiten, aktuell, imFlow) {

    var html = '';
    seiten.forEach(function(s) {
        // Aktiv ist die aktuelle Seite. Im Anlage-Ablauf (tier/ort) ist
        // "Anlegen" der aktive Punkt.
        var aktiv = (s.href === aktuell) || (imFlow && s.href === 'tier.html');
        var klasse = 'bottom-nav-item' + (aktiv ? ' aktiv' : '');
        html += '<a class="' + klasse + '" href="' + s.href + '">' +
                    '<i class="bi ' + s.icon + '"></i>' +
                    '<span>' + s.kurz + '</span>' +
                '</a>';
    });

    var leiste = document.createElement('nav');
    leiste.className = 'bottom-nav';
    leiste.innerHTML = html;
    document.body.appendChild(leiste);
}


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
