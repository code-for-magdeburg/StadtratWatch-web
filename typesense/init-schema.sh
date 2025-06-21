#!/bin/sh

TypesenseServerUrl="$1"
CollectionName="$2"
ApiKey="$3"

Url="${TypesenseServerUrl}/collections"

Body=$(cat <<EOF
{
  "name": "${CollectionName}",
  "enable_nested_fields": true,
  "fields": [
    {"name": "type", "type": "string", "facet": true},
    {"name": "content", "type": "string[]", "locale": "de"},
    {"name": "paper_name", "type": "string", "locale": "de"},
    {"name": "paper_type", "type": "string", "facet": true, "locale": "de"},
    {"name": "paper_reference", "type": "string"},
    {"name": "speech_electoral_period", "type": "string", "facet": true},
    {"name": "speech_session", "type": "string", "index": false},
    {"name": "speech_start", "type": "int32", "index": false},
    {"name": "speech_session_date", "type": "int64", "sort": true},
    {"name": "speech_speaker", "type": "string", "facet": true},
    {"name": "speech_faction", "type": "string", "facet": true, "optional": true},
    {"name": "speech_party", "type": "string", "facet": true, "optional": true},
    {"name": "speech_on_behalf_of", "type": "string", "facet": true, "optional": true}
  ],
  "enable_nested_fields": false,
  "symbols_to_index": [],
  "token_separators": ["/"]
}
EOF
)

curl -X POST "$Url" \
  -H "X-TYPESENSE-API-KEY: $ApiKey" \
  -H "Content-Type: application/json" \
  -d "$Body"
