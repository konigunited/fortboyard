$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = Join-Path $PSScriptRoot "tz.docx"
$doc = $word.Documents.Open($docPath)
$text = $doc.Content.Text
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

$outputPath = Join-Path $PSScriptRoot "tz_text.txt"
[System.IO.File]::WriteAllText($outputPath, $text, [System.Text.Encoding]::UTF8)
Write-Output "Text saved to $outputPath"
