Get-ChildItem -Path ".\theCleanedSVGs\*.txt" | ForEach-Object {
    $target = ".\public\assets\$( (Get-Item $_.FullName).BaseName ).svg"
    .\svgcleaningTXTtoSVG.ps1 -InputFile $_.FullName -OutputFile $target
}