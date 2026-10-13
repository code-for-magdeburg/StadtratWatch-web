# StadtratWatch

Beobachtung des Magdeburger Stadtrats: Sitzungen, Abstimmungen und Redebeiträge werden aus Videos und OParl-Daten aufbereitet und als statische Website veröffentlicht.

## Language

### Redebeiträge

**Redebeitrag**:
Ein zusammenhängender Wortbeitrag einer Person in einer Sitzung, identifiziert durch Sitzung und Startzeitpunkt; sein Text ist das maschinell erstellte, von Hand korrigierte Transkript.
_Avoid_: Rede, Speech (außer im Code), Wortmeldung

**KI-Einschätzung**:
Das Ergebnis eines KI-Textdetektors für den Text eines Redebeitrags: Label (KI / gemischt / menschlich), Konfidenz und Anteilswerte, zusammen mit der Modellversion und dem Prüfdatum. Eine probabilistische Einschätzung, kein Beweis.
_Avoid_: KI-Verdacht, KI-Score, GenAI-Check, AI detection (außer im Code: `AiTextAssessment`)

**Ausgewählter Redebeitrag**:
Ein Redebeitrag, den die Redaktion gezielt für eine KI-Einschätzung ausgewählt hat. Nicht alle Redebeiträge einer Sitzung werden eingeschätzt.
_Avoid_: geprüfter Beitrag, gescannter Beitrag

**Kontrollkorpus**:
Eine Menge von Redebeiträgen aus der Zeit vor generativer KI (vor 2023), an der die Fehlalarmquote des Detektors auf diesem Textmaterial gemessen wird, bevor KI-Einschätzungen veröffentlicht werden.
_Avoid_: Testdaten, Baseline, Referenzmenge
