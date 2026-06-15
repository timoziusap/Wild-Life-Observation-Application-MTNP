// nav.js
// Gemeinsame Dropdown-Navigation fuer alle Seiten (ohne jQuery, damit es auch
// auf der Startseite laeuft). Baut in das <nav> ein Aufklapp-Menue:
//  - die anderen Seiten sind anklickbar,
//  - die aktuelle Seite steht im Menue, ist aber ausgegraut,
//  - "Startseite" gibt es nicht als Eintrag: ein Klick auf den Titel (Header)
//    fuehrt zur Startseite.

document.addEventListener('DOMContentLoaded', function() {

    // Seiten im Menue (ohne Startseite).
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

    // Menue in jedes <nav> einsetzen (pro Seite genau eines).
    var nav = document.querySelector('nav');
    if (nav) {
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
