# Regenerates the Playwright baselines from the pristine Figma exports in this
# folder. The frame is compared in two bands (first viewport / below the fold)
# because the docked nav is viewport-anchored — see frames.spec.ts.
#
#   powershell -ExecutionPolicy Bypass -File tests\visual\refs\crop-baselines.ps1
#
# All numbers are the Figma frame geometry multiplied by 2 (Figma exports at 2x,
# and Playwright runs at deviceScaleFactor 2).
#
# The exports are regenerated with the Figma MCP:
#   download_assets(fileKey, nodeId, defaultFormat='png', defaultScale=2)
# get_screenshot only ever renders at 1x -- its maxDimension caps, it never
# upscales -- so it cannot produce a baseline that matches deviceScaleFactor 2.
#
# ChromeHeight is the device framing a frame draws at y=0 that the app itself
# never renders: 54px for the "Status Bar - iPhone" instance on the mobile
# frames, and 118px on the desktop FanDuel frame, whose top band is a
# screenshot of the macOS menu bar and Chrome's tab/address/bookmark bars
# (803:5315, 803:5316) presenting the page inside a browser. The app starts at
# page content instead (see AllTeams.test.ts), so that band is cropped off the
# top of the export and Height is the frame height minus it -- which is what
# src/routes/screens.ts records and what frames.spec.ts clips to.

Add-Type -AssemblyName System.Drawing

$refs = $PSScriptRoot
$out = Join-Path (Split-Path $refs -Parent) '__screenshots__\figma-fidelity'

$frames = @(
    @{
        Source         = 'homepage-162-1721.png'
        Id             = '162-1721'
        Scale          = 2
        Width          = 430
        Height         = 1643
        ChromeHeight   = 54
        ViewportHeight = 878
    },
    @{
        Source         = 'all-teams-162-1760.png'
        Id             = '162-1760'
        Scale          = 2
        Width          = 430
        Height         = 2877
        ChromeHeight   = 54
        ViewportHeight = 932
    },
    @{
        Source         = 'individual-team-162-1586.png'
        Id             = '162-1586'
        Scale          = 2
        Width          = 430
        Height         = 5469
        ChromeHeight   = 54
        ViewportHeight = 932
    },
    @{
        Source         = 'bets-251-2889.png'
        Id             = '251-2889'
        Scale          = 2
        Width          = 430
        # The frame is 4861 tall; its last 1098 are flat #011556 with nothing
        # drawn on them, and the app stops at 3908 instead. See screens.ts.
        Height         = 3908
        ChromeHeight   = 54
        ViewportHeight = 932
    },
    @{
        Source         = 'awards-188-2037.png'
        Id             = '188-2037'
        Scale          = 2
        Width          = 430
        Height         = 1453
        ChromeHeight   = 54
        ViewportHeight = 932
    },
    @{
        Source         = 'fanduel-803-5180.png'
        Id             = '803-5180'
        Scale          = 2
        Width          = 1280
        Height         = 1097
        ChromeHeight   = 118
        ViewportHeight = 782
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
    # The export still carries the device chrome the app does not render, so the
    # file is that much taller than the band being compared.
    $chromeH = $frame.ChromeHeight * $s
    # Height may be shorter than the export when the frame ends in a band of
    # blank fill the app does not reproduce (Bets 251:2889), so the file only has
    # to be wide enough and at least tall enough to cut the compared band from.
    if ($image.Width -ne $expectedW -or $image.Height -lt ($expectedH + $chromeH)) {
        $image.Dispose()
        throw "$($frame.Source) is $($image.Width)x$($image.Height); expected ${expectedW}x$($expectedH + $chromeH) or taller."
    }

    $foldY = $frame.ViewportHeight * $s
    Save-Crop $image 0 $chromeH $expectedW $foldY (Join-Path $out "$($frame.Id)-viewport.png")
    Save-Crop $image 0 ($chromeH + $foldY) $expectedW ($expectedH - $foldY) (Join-Path $out "$($frame.Id)-below-fold.png")

    $image.Dispose()
}
