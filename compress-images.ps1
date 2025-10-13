# PowerShell script to compress images
Add-Type -AssemblyName System.Drawing

$sourceFolder = "assets\взрослые др галерея"
$destFolder = "assets\gallery\adults"

# Create destination folder if it doesn't exist
if (-not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force
}

# Get all image files
$images = Get-ChildItem -Path $sourceFolder -Include *.jpg,*.jpeg,*.png -File

$counter = 1

foreach ($image in $images) {
    Write-Host "Processing: $($image.Name)"

    try {
        # Load the image
        $img = [System.Drawing.Image]::FromFile($image.FullName)

        # Calculate new dimensions (max 1920px width, maintain aspect ratio)
        $maxWidth = 1920
        $maxHeight = 1080

        $ratioX = $maxWidth / $img.Width
        $ratioY = $maxHeight / $img.Height
        $ratio = [Math]::Min($ratioX, $ratioY)

        if ($ratio -lt 1) {
            $newWidth = [int]($img.Width * $ratio)
            $newHeight = [int]($img.Height * $ratio)
        } else {
            $newWidth = $img.Width
            $newHeight = $img.Height
        }

        # Create new bitmap
        $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)

        # Save with JPEG quality 85
        $outputPath = Join-Path $destFolder "adults-$counter.jpg"

        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, 85
        )

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq 'image/jpeg' }

        $newImg.Save($outputPath, $jpegCodec, $encoderParams)

        # Clean up
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()

        Write-Host "Saved: adults-$counter.jpg" -ForegroundColor Green
        $counter++
    }
    catch {
        Write-Host "Error processing $($image.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nTotal images processed: $($counter - 1)" -ForegroundColor Cyan
