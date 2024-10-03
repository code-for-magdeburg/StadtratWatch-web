
$TypesenseServerUrl = $args[0]
$PapersCollectionName = $args[1]
$SpeechesCollectionName = $args[2]
$ApiKey = $args[3]

$Url = "${TypesenseServerUrl}/collections"

$Headers = @{
    "X-TYPESENSE-API-KEY" = $ApiKey
    "Content-Type" = "application/json"
}

$Body = @"
{
    "name": "${PapersCollectionName}",
    "fields": [
      {"name": "name", "type": "string", "locale": "de"},
      {"name": "type", "type": "string", "facet": true, "locale": "de"},
      {"name": "reference", "type": "string"},
      {"name": "sort_date", "type": "int32", "sort": true},
      {"name": "files_content", "type": "string[]", "locale": "de"}
    ],
    "default_sorting_field": "sort_date",
    "enable_nested_fields": false,
    "symbols_to_index": [],
    "token_separators": ["/"]
}
"@

Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body


$Body = @"
{
    "name": "${SpeechesCollectionName}",
    "fields": [
      {"name": "session_date", "type": "int64"},
      {"name": "start", "type": "int32", "index": false},
      {"name": "speaker", "type": "string", "facet": true},
      {"name": "faction", "type": "string", "facet": true, "optional": true},
      {"name": "on_behalf_of", "type": "string", "facet": true, "optional": true},
      {"name": "transcription", "type": "string", "locale": "de"}
    ],
    "default_sorting_field": "session_date",
    "enable_nested_fields": false,
    "symbols_to_index": [],
    "token_separators": []
}
"@

Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body
