// feed.js
// Feed der neuesten Sichtungen auf der Startseite (im Instagram-Stil).
// Pro Sichtung: oben wer sie eingetragen hat, darunter das Bild (falls vorhanden),
// dann ein Like-Knopf (ohne Namensangabe) und ein Kommentarbereich
// (zum Kommentieren ist ein Name Pflicht).
//
// Bewusst ohne jQuery geschrieben, damit es auch auf der Startseite laeuft
// (dort ist jQuery nicht eingebunden). Reines Fetch/DOM.


document.addEventListener('DOMContentLoaded', function () {

    // Mobil-Knopf: blendet den Feed ein/aus. Am PC ist der Feed per CSS
    // immer sichtbar und der Knopf ausgeblendet.
    var toggle = document.getElementById('feedToggle');
    var section = document.querySelector('.feed-section');
    if (toggle && section) {
        toggle.addEventListener('click', function () {
            section.classList.toggle('feed-offen');
            toggle.innerHTML = section.classList.contains('feed-offen')
                ? '<i class="bi bi-x-lg"></i> Neueste Sichtungen ausblenden'
                : '<i class="bi bi-card-list"></i> Neueste Sichtungen anzeigen';
        });
    }

    ladeFeed();
});


// Holt die neuesten Sichtungen vom Backend und baut die Karten.
function ladeFeed() {
    var feed = document.getElementById('feed');
    if (!feed) {
        return;
    }

    fetch('/observations/latest')
        .then(function (r) { return r.json(); })
        .then(function (sichtungen) {
            feed.innerHTML = '';
            if (!sichtungen || sichtungen.length === 0) {
                feed.innerHTML = '<p class="feed-hinweis">Noch keine Sichtungen vorhanden.</p>';
                return;
            }
            sichtungen.forEach(function (s) {
                feed.appendChild(baueKarte(s));
            });
        })
        .catch(function (e) {
            feed.innerHTML = '<p class="feed-hinweis">Feed konnte nicht geladen werden.</p>';
            console.log('Feed-Fehler: ' + e);
        });
}


// Baut eine einzelne Feed-Karte zu einer Sichtung.
function baueKarte(s) {
    var tier = s.animal || {};
    var gattung = tier.genus || {};
    var ort = s.location || {};

    var melder = s.reporter || 'unbekannt';
    var titel = gattung.designation || 'Unbekannte Art';
    var ortText = ort.shorttitle || 'unbekannter Ort';
    var datum = (s.date || '') + (s.time ? ' ' + s.time : '');

    var karte = document.createElement('article');
    karte.className = 'feed-karte';

    // ---------- Kopf: wer hat es eingetragen ----------
    var kopf = document.createElement('div');
    kopf.className = 'feed-karte-kopf';
    kopf.innerHTML =
        '<div class="feed-avatar"><i class="bi bi-person-circle"></i></div>' +
        '<div class="feed-kopf-text">' +
            '<span class="feed-melder">' + escapeHtml(melder) + '</span>' +
            '<span class="feed-meta">' + escapeHtml(datum) + '</span>' +
        '</div>';
    karte.appendChild(kopf);

    // ---------- Bild (nur wenn vorhanden) ----------
    if (s.hasImage) {
        var bild = document.createElement('img');
        bild.className = 'feed-bild';
        bild.src = '/observations/' + s.id + '/image';
        bild.alt = 'Bild der Sichtung: ' + titel;
        bild.loading = 'lazy';
        karte.appendChild(bild);
    }

    // ---------- Info-Zeile: Art und Ort ----------
    var info = document.createElement('div');
    info.className = 'feed-info';
    info.innerHTML =
        '<strong>' + escapeHtml(titel) + '</strong> &middot; ' +
        '<i class="bi bi-geo-alt"></i> ' + escapeHtml(ortText);
    karte.appendChild(info);

    // ---------- Aktionsleiste: Like ----------
    var aktionen = document.createElement('div');
    aktionen.className = 'feed-aktionen';

    var likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'feed-like-btn';
    likeBtn.innerHTML = '<i class="bi bi-heart"></i> <span class="like-zahl">'
        + (s.likes || 0) + '</span>';
    likeBtn.addEventListener('click', function () {
        likeSichtung(s.id, likeBtn);
    });
    aktionen.appendChild(likeBtn);

    // Kommentar-Symbol mit Zaehler (wie bei Instagram). Klick springt
    // zum Kommentar-Eingabefeld dieser Karte.
    var kommBtn = document.createElement('button');
    kommBtn.type = 'button';
    kommBtn.className = 'feed-komm-btn';
    kommBtn.innerHTML = '<i class="bi bi-chat"></i> <span class="komm-zahl" id="kommzahl-'
        + s.id + '">0</span>';
    aktionen.appendChild(kommBtn);

    karte.appendChild(aktionen);

    // ---------- Kommentare ----------
    var kommentare = document.createElement('div');
    kommentare.className = 'feed-kommentare';
    kommentare.innerHTML = '<div class="kommentar-liste" id="komm-' + s.id + '">'
        + '<p class="feed-hinweis">Kommentare werden geladen …</p></div>';

    // Eingabe fuer einen neuen Kommentar (Name ist Pflicht).
    var form = document.createElement('div');
    form.className = 'kommentar-form';
    form.innerHTML =
        '<input type="text" class="komm-name" placeholder="Dein Name" maxlength="60">' +
        '<div class="kommentar-form-zeile">' +
            '<input type="text" class="komm-text" placeholder="Kommentar schreiben …" maxlength="500">' +
            '<button type="button" class="komm-senden">Senden</button>' +
        '</div>';
    kommentare.appendChild(form);
    karte.appendChild(kommentare);

    // Senden-Knopf verdrahten.
    form.querySelector('.komm-senden').addEventListener('click', function () {
        var name = form.querySelector('.komm-name').value;
        var text = form.querySelector('.komm-text').value;
        sendeKommentar(s.id, name, text, form);
    });

    // Klick auf das Kommentar-Symbol: zum Eingabefeld springen und fokussieren.
    kommBtn.addEventListener('click', function () {
        var feld = form.querySelector('.komm-text');
        feld.scrollIntoView({ behavior: 'smooth', block: 'center' });
        feld.focus();
    });

    // Vorhandene Kommentare laden.
    ladeKommentare(s.id);

    return karte;
}


// Zaehlt einen Like hoch (kein Name noetig) und aktualisiert die Anzeige.
function likeSichtung(id, btn) {
    fetch('/observations/' + id + '/like', { method: 'POST' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var zahl = btn.querySelector('.like-zahl');
            if (zahl && data && typeof data.likes === 'number') {
                zahl.textContent = data.likes;
            }
            btn.classList.add('geliked');
        })
        .catch(function (e) { console.log('Like-Fehler: ' + e); });
}


// Laedt die Kommentare einer Sichtung und zeigt sie an.
function ladeKommentare(id) {
    var liste = document.getElementById('komm-' + id);
    if (!liste) {
        return;
    }
    fetch('/observations/' + id + '/comments')
        .then(function (r) { return r.json(); })
        .then(function (kommentare) {
            // Kommentar-Zaehler in der Aktionsleiste aktualisieren.
            var zaehler = document.getElementById('kommzahl-' + id);
            if (zaehler) {
                zaehler.textContent = (kommentare && kommentare.length) ? kommentare.length : 0;
            }
            liste.innerHTML = '';
            if (!kommentare || kommentare.length === 0) {
                liste.innerHTML = '<p class="feed-hinweis">Noch keine Kommentare.</p>';
                return;
            }
            kommentare.forEach(function (k) {
                var z = document.createElement('p');
                z.className = 'kommentar';
                z.innerHTML = '<span class="komm-autor">' + escapeHtml(k.author || 'unbekannt')
                    + '</span> ' + escapeHtml(k.text || '');
                liste.appendChild(z);
            });
        })
        .catch(function (e) {
            liste.innerHTML = '<p class="feed-hinweis">Kommentare konnten nicht geladen werden.</p>';
            console.log('Kommentar-Fehler: ' + e);
        });
}


// Schickt einen neuen Kommentar ab. Name und Text sind Pflicht.
function sendeKommentar(id, name, text, form) {
    if (!name || name.trim() === '') {
        alert('Bitte deinen Namen angeben, um zu kommentieren.');
        return;
    }
    if (!text || text.trim() === '') {
        alert('Bitte einen Kommentartext eingeben.');
        return;
    }

    fetch('/observations/' + id + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: name.trim(), text: text.trim() })
    })
        .then(function (r) {
            if (!r.ok) {
                throw new Error('Status ' + r.status);
            }
            return r.json();
        })
        .then(function () {
            // Textfeld leeren (Name darf stehen bleiben) und Liste neu laden.
            form.querySelector('.komm-text').value = '';
            ladeKommentare(id);
        })
        .catch(function (e) {
            alert('Kommentar konnte nicht gespeichert werden.');
            console.log('Kommentar-Speichern-Fehler: ' + e);
        });
}


// Kleiner Schutz: macht aus Sonderzeichen harmlosen Text (gegen HTML-Injektion).
function escapeHtml(wert) {
    if (wert == null) {
        return '';
    }
    return String(wert)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
