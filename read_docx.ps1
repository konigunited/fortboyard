$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = Join-Path $PSScriptRoot "tz.docx"
$doc = $word.Documents.Open($docPath)
$text = $doc.Content.Text
Write-Output $text
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
