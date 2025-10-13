$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("C:\Users\F12`$\Downloads\Главная страница сайта 2 (1).docx")
$text = $doc.Content.Text
Write-Output $text
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
