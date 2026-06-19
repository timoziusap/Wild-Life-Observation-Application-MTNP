// schonzeit.js
// Prueft, ob eine Tierart an einem bestimmten Datum geschuetzt ist (Schonzeit),
// also nicht bejagt werden darf. Grundlage ist der eingetragene Zeitraum, der
// die SCHONZEIT (geschuetzte Zeit) beschreibt:
//   - liegt das Datum IM Zeitraum            -> geschuetzt (Schonzeit)
//   - "ganzjährig geschont" o.ae. ohne Datum -> ganzjaehrig geschuetzt
//   - sonst                                  -> jagdbar (leerer String)
//
// Reine Berechnung, kein Zugriff auf die Seite. Wird von tier.js und
// schutzzeiten.js verwendet, damit ueberall dieselbe Logik gilt.

// gattung: Objekt mit huntingSeason (Text, = Schonzeit)
// datumStr: Datum als Text "YYYY-MM-DD"
// Rueckgabe: Hinweistext wenn geschuetzt, sonst leerer String.
function schonzeitHinweis(gattung, datumStr) {
    if (!gattung || !datumStr) {
        return '';
    }

    var jagd = gattung.huntingSeason || '';
    var tief = jagd.toLowerCase();

    // Text wie "ganzjaehrig geschont" ohne konkrete Datumsangabe: immer geschuetzt.
    var klingtGeschont = tief.indexOf('geschont') !== -1
        || tief.indexOf('ganzjährig') !== -1
        || tief.indexOf('ganzjaehrig') !== -1;
    if (klingtGeschont && !/\d/.test(jagd)) {
        return 'Ganzjährig geschont, darf nicht bejagt werden.';
    }

    // Zwei Datumsangaben "TT.MM." aus dem Zeitraum herausziehen.
    var treffer = jagd.match(/(\d{1,2})\.(\d{1,2})\.?\s*-\s*(\d{1,2})\.(\d{1,2})\./);
    if (!treffer) {
        // unbekanntes Format oder "keine" -> kein Hinweis (jagdbar)
        return '';
    }

    var startMonatTag = parseInt(treffer[2], 10) * 100 + parseInt(treffer[1], 10);
    var endeMonatTag  = parseInt(treffer[4], 10) * 100 + parseInt(treffer[3], 10);

    var teile = datumStr.split('-'); // [YYYY, MM, DD]
    if (teile.length < 3) {
        return '';
    }
    var heuteMonatTag = parseInt(teile[1], 10) * 100 + parseInt(teile[2], 10);

    // Liegt das Datum im Schutzzeitraum (= Schonzeit)?
    var imSchutzzeitraum;
    if (startMonatTag <= endeMonatTag) {
        imSchutzzeitraum = heuteMonatTag >= startMonatTag && heuteMonatTag <= endeMonatTag;
    } else {
        // Zeitraum laeuft ueber den Jahreswechsel (z.B. 01.11. - 31.01.)
        imSchutzzeitraum = heuteMonatTag >= startMonatTag || heuteMonatTag <= endeMonatTag;
    }

    if (imSchutzzeitraum) {
        return 'Schonzeit, an diesem Datum darf nicht bejagt werden.';
    }
    return '';
}
