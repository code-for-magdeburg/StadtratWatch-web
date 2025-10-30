---
layout: ../../layouts/BlogPostLayout.astro
---

# StadtratWatch API

StadtratWatch hat eine öffentliche Schnittstelle, die es Entwickler:innen und Bürger:innen ermöglicht, direkt auf die Daten zuzugreifen. Die API v1 bietet strukturierten Zugang zu Legislaturperioden, Redebeiträgen und Abstimmungsergebnissen.

## Verfügbare Endpunkte

**Legislaturperioden**

- `GET /api/v1/parliament-periods.json` - Liste aller Legislaturperioden
- `GET /api/v1/parliament-periods/[id].json` - Details zu einer spezifischen Legislaturperiode

**Redebeiträge**

- `GET /api/v1/parliament-periods/[id]/speeches/[sessionId].json` - Redebeiträge einer Sitzung

**Abstimmungen**

- `GET /api/v1/parliament-periods/[id]/votings/[sessionId].json` - Abstimmungsergebnisse einer Sitzung

## Lizenz und Nutzung

Alle über die API bereitgestellten Daten stehen unter der CC0 1.0 Lizenz und können ohne Einschränkungen genutzt werden. Die API ist kostenlos und erfordert keine Authentifizierung.

## Technische Details

Die API nutzt statische Generierung für optimale Performance und liefert strukturierte JSON-Antworten. Jede Antwort enthält Metadaten zur API-Version und Lizenzinformationen.
