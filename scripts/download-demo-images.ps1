# PowerShell script to download sample NIH-style Chest X-ray images for MediAnnote demo
$medicalDir = Join-Path (Get-Location) "public\medical"

if (-not (Test-Path $medicalDir)) {
    New-Item -ItemType Directory -Path $medicalDir
}

$images = @(
    @{
        Url = "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/000001-1.jpg"
        Name = "xray-1.jpg"
    },
    @{
        Url = "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/000001-2.jpg"
        Name = "xray-2.jpg"
    },
    @{
        Url = "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/000001-3.jpg"
        Name = "xray-3.jpg"
    },
    @{
        Url = "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/000001-4.jpg"
        Name = "xray-4.jpg"
    },
    @{
        Url = "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/000001-5.jpg"
        Name = "xray-5.jpg"
    }
)

Write-Host "Downloading demo medical images to $medicalDir..." -ForegroundColor Cyan

foreach ($img in $images) {
    $targetPath = Join-Path $medicalDir $img.Name
    if (-not (Test-Path $targetPath)) {
        Write-Host "Downloading $($img.Name)..."
        try {
            Invoke-WebRequest -Uri $img.Url -OutFile $targetPath
        } catch {
            Write-Host "Failed to download $($img.Name). Skipping." -ForegroundColor Yellow
        }
    } else {
        Write-Host "$($img.Name) already exists." -ForegroundColor Green
    }
}

Write-Host "Download complete. Your demo images are ready in public/medical/" -ForegroundColor Green
