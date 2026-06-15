// schonzeit.js
// Prueft ob eine Tierart an einem bestimmten Datum Schonzeit hat, also nicht
// bejagt werden darf. Grundlage: der Schutzstatus der Gattung und der
// Jagdzeitraum-Text (huntingSeason, z.B. "01.05. - 31.01.").
//
// Reine Berechnung, kein Zugriff auf die Seite. Wird von anderen Skripten
// aufgerufen (z.B. tier.js) und liefert einen fertigen Warntext zurueck.

// gattung: Objekt mit protectedSpecies (true/false) und huntingSeason (Text)
// datumStr: Datum als Text im Format "YYYY-MM-DD" (z.B. Sichtungsdatum oder heute)
// Rueckgabe: ein Warntext, oder leerer String wenn kein Hinweis noetig ist.
function schonzeitHinweis(gattung, datumStr) {
    if (!gattung || !datumStr) {
        return '';
    }

    // Geschuetzte Arten duerfen nie bejagt werden.
    if (gattung.protectedSpecies) {
        return 'Geschützte Art, ganzjährig Schonzeit, darf nicht bejagt werden.';
    }

    var jagd = gattung.huntingSeason || '';
    var tief = jagd.toLowerCase();

    // Text wie "ganzjaehrig geschont" ohne konkrete Datumsangabe: immer Schonzeit.
    var klingtGeschont = tief.indexOf('geschont') !== -1
        || tief.indexOf('ganzjährig') !== -1
        || tief.indexOf('ganzjaehrig') !== -1;
    if (klingtGeschont && !/\d/.test(jagd)) {
        return 'Ganzjährig geschont, Schonzeit, darf nicht bejagt werden.';
    }

    // Zwei Datumsangaben "TT.MM." aus dem Jagdzeitraum herausziehen.
    var treffer = jagd.match(/(\d{1,2})\.(\d{1,2})\.?\s*-\s*(\d{1,2})\.(\d{1,2})\./);
    if (!treffer) {
        // unbekanntes Format -> lieber keinen Hinweis als einen falschen
        return '';
    }

    var startMonatTag = parseInt(treffer[2], 10) * 100 + parseInt(treffer[1], 10);
    var endeMonatTag  = parseInt(treffer[4], 10) * 100 + parseInt(treffer[3], 10);

    var teile = datumStr.split('-'); // [YYYY, MM, DD]
    if (teile.length < 3) {
        return '';
    }
    var heuteMonatTag = parseInt(teile[1], 10) * 100 + parseInt(teile[2], 10);

    // Liegt das Datum in der Jagdzeit?
    var inJagdzeit;
    if (startMonatTag <= endeMonatTag) {
        // normale Spanne innerhalb eines Jahres
        inJagdzeit = heuteMonatTag >= startMonatTag && heuteMonatTag <= endeMonatTag;
    } else {
        // Spanne laeuft ueber den Jahreswechsel (z.B. 01.05. - 31.01.)
        inJagdzeit = heuteMonatTag >= startMonatTag || heuteMonatTag <= endeMonatTag;
    }

    if (inJagdzeit) {
        return '';
    }
    return 'Schonzeit, an diesem Datum darf nicht bejagt werden.';
}
