# Regenerates the Playwright baselines from the pristine Figma exports in this
# folder. The frame is compared in two bands (first viewport / below the fold)
# because the docked nav is viewport-anchored — see frames.spec.ts.
#
#   powershell -ExecutionPolicy Bypass -File tests\visual\refs\crop-baselines.ps1
#
# All numbers are the Figma frame geometry multiplied by 2 (Figma exports at 2x,
# and Playwright runs at deviceScaleFactor 2).

Add-Type -AssemblyName System.Drawing

$refs = $PSScriptRoot
$out = Join-Path (Split-Path $refs -Parent) '__screenshots__\figma-fidelity'

$frames = @(
    @{
        Source         = 'homepage-1-90.png'
        Id             = '1-90'
        Scale          = 2
        Width          = 430
        Height         = 1697
        ViewportHeight = 932
    }
)

function Save-Crop {
    param([System.Drawing.Image]$Image, [int]$X, [int]$Y, [int]$W, [int]$H, [string]$Path)

    $dest = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.DrawImage(
        $Image,
        (New-Object System.Drawing.Rectangle 0, 0, $W, $H),
        (New-Object System.Drawing.Rectangle $X, $Y, $W, $H),
        [System.Drawing.GraphicsUnit]::Pixel
    )
    $g.Dispose()
    $dest.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "wrote $Path ($W x $H)"
}

if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

foreach ($frame in $frames) {
    $sourcePath = Join-Path $refs $frame.Source
    $image = [System.Drawing.Image]::FromFile($sourcePath)

    $s = $frame.Scale
    $expectedW = $frame.Width * $s
    $expectedH = $frame.Height * $s
    if ($image.Width -ne $expectedW -or $image.Height -ne $expectedH) {
        $image.Dispose()
        throw "$($frame.Source) is $($image.Width)x$($image.Height); expected ${expectedW}x${expectedH}."
    }

    $foldY = $frame.ViewportHeight * $s
    Save-Crop $image 0 0 $expectedW $foldY (Join-Path $out "$($frame.Id)-viewport.png")
    Save-Crop $image 0 $foldY $expectedW ($expectedH - $foldY) (Join-Path $out "$($frame.Id)-below-fold.png")

    $image.Dispose()
}
