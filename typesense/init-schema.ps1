
$TypesenseServerUrl = $args[0]
$FilesCollectionName = $args[1]
$PapersCollectionName = $args[2]
$ApiKey = $args[3]

$Url = "${TypesenseServerUrl}/collections"

$Headers = @{
    "X-TYPESENSE-API-KEY" = $ApiKey
    "Content-Type" = "application/json"
}

$Body = @"
{
    "name": "${FilesCollectionName}",
    "fields": [
      {"name": "name", "type": "string", "locale": "de"},
      {"name": "content", "type": "string", "locale": "de"},
      {"name": "url", "type": "string", "index": false},
      {"name": "paper_id", "type": "int32", "index": false},
      {"name": "paper_name", "type": "string", "locale": "de"},
      {"name": "paper_type", "type": "string", "facet": true, "locale": "de"},
      {"name": "paper_reference", "type": "string"}
    ],
    "default_sorting_field": "",
    "enable_nested_fields": false,
    "symbols_to_index": [],
    "token_separators": ["/"]
}
"@

Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body


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
