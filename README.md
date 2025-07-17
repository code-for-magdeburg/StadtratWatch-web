# StadtratWatch

Eine umfassende Plattform für Bürgerbeteiligung und Transparenz im Magdeburger Stadtrat. StadtratWatch verfolgt Stadtratssitzungen, analysiert Abstimmungsverhalten und bietet Werkzeuge für demokratische Teilhabe.

## Hauptfunktionen

- **Mehrdimensionale politische Analyse** - Umfassende Dashboards für Abstimmungsverhalten und Beteiligung
- **Sitzungsverfolgung** - Video/Audio-Verarbeitung mit Redner-Identifikation
- **Abstimmungsanalyse** - Statistische Auswertung von Abstimmungsmustern
- **Personenspezifische Matrizen** - Detaillierte Abstimmungsübersichten für einzelne Stadtratsmitglieder
- **Redebeitragsanalyse** - Transkription und Analyse von Redebeiträgen
- **Fraktions- und Parteivergleiche** - Vergleichende Analyse politischer Gruppierungen
- **Öffentliche API** - Programmatischer Zugang zu Parlamentsdaten
- **Volltext-Suche** - Durchsuchung aller Dokumente und Protokolle

## Technische Architektur

### Frontend
- **Astro** - Modern Static Site Generator
- **Alpine.js** - Leichtgewichtiges Framework für interaktive Komponenten
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS + DaisyUI** - Modernes Styling-Framework
- **Chart.js + D3.js** - Datenvisualisierung

### Backend & Datenverarbeitung
- **Deno** - Moderne JavaScript/TypeScript-Runtime
- **Docker** - Containerisierte Verarbeitungspipeline
- **Typesense** - Hochperformante Suchmaschine
- **OpenAI API** - Sprachtranskription

## Projektstruktur

```
StadtratWatch-web/
├── astro/                      # Web-Anwendung
│   ├── src/
│   │   ├── components/         # Wiederverwendbare Komponenten
│   │   ├── data-analysis/      # Analysealgorithmen
│   │   ├── models/            # Datenmodelle
│   │   ├── pages/             # Seiten und API-Routen
│   │   └── utils/             # Hilfsfunktionen
│   └── package.json
├── data/                       # Parlamentsdaten
├── docker/                     # Container-Definitionen
├── src/                        # Deno-Skripte
└── typesense/                  # Suchindex-Konfiguration
```

## Öffentliche API

StadtratWatch bietet eine öffentliche REST API v1 für den Zugriff auf Parlamentsdaten. Mehr Informationen finden Sie in der [API-Dokumentation](./astro/src/pages/api/README.md).

### Daten-Lizenz

Die über die API bereitgestellten Daten stehen unter der CC0 1.0 Universal Lizenz zur freien Verfügung.


## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## Kontakt

- **Projekt**: [Code for Magdeburg](https://codefor.de/magdeburg/)
- **Issues**: [GitHub Issues](https://github.com/CodeForMD/StadtratWatch-web/issues)
- **Website**: [stadtratwatch.de](https://stadtratwatch.de)

---

*StadtratWatch ist eine Initiative von Code for Magdeburg zur Förderung von Transparenz und Bürgerbeteiligung in der Kommunalpolitik.*
