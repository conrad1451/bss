# Define target directory
$baseDir = ".\public\assets\"

# Create standard subdirectories
$folders = @("buffs", "passives", "items", "ui")
foreach ($folder in $folders) {
    if (!(Test-Path "$baseDir$folder")) { New-Item -ItemType Directory -Path "$baseDir$folder" }
}

# Move files based on keyword detection in filename
Get-ChildItem -Path $baseDir -Filter "*.svg" | ForEach-Object {
    $name = $_.Name
    $destFolder = "ui" # Default fallback

    if ($name -match "Boost|Buff|Nectar|Surge|Heat|Fuel|Power|Drive") { $destFolder = "buffs" }
    elseif ($name -match "Passive|Aura|Mark|Morph|Blessing|Cheer|Combo") { $destFolder = "passives" }
    elseif ($name -match "JellyBean|Ticket|Stinger|Coconut|Oil|Glue|Gumdrops") { $destFolder = "items" }
    
    # Move the file
    $destPath = Join-Path "$baseDir$destFolder" $name
    if ($_.FullName -ne $destPath) {
        Write-Host "Moving $name -> $destFolder/"
        Move-Item -Path $_.FullName -Destination $destPath -Force
    }
}