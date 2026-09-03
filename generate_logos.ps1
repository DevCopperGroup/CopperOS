Add-Type -AssemblyName System.Drawing

$outputDir = "C:\Users\rauli\.gemini\antigravity-ide\scratch\copperos\public\logos"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

function Generate-AFLocacoes {
    $bmp = New-Object System.Drawing.Bitmap 400, 400
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::White)

    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(27, 108, 168))
    
    $g.FillRectangle($blueBrush, 180, 80, 150, 36)
    $g.FillRectangle($blueBrush, 210, 145, 105, 34)
    
    $pts = @(
        (New-Object System.Drawing.PointF 65, 244),
        (New-Object System.Drawing.PointF 165, 244),
        (New-Object System.Drawing.PointF 185, 210),
        (New-Object System.Drawing.PointF 85, 210)
    )
    $g.FillPolygon($blueBrush, $pts)

    $copperBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.PointF 60, 80), (New-Object System.Drawing.PointF 230, 240), ([System.Drawing.Color]::FromArgb(217, 119, 54)), ([System.Drawing.Color]::FromArgb(140, 59, 20))
    
    $aPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $aOuter = @(
        (New-Object System.Drawing.PointF 165, 80),
        (New-Object System.Drawing.PointF 60, 240),
        (New-Object System.Drawing.PointF 112, 240),
        (New-Object System.Drawing.PointF 145, 190),
        (New-Object System.Drawing.PointF 178, 240),
        (New-Object System.Drawing.PointF 230, 240)
    )
    $aPath.AddPolygon($aOuter)
    $g.FillPath($copperBrush, $aPath)

    $font = New-Object System.Drawing.Font "Arial", [float]20, [System.Drawing.FontStyle]::Bold
    $copperSolid = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(184, 93, 38))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("L O C A Ç Õ E S", $font, $copperSolid, [float]200, [float]280, $sf)

    $bmp.Save("$outputDir\af-locacoes.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Generate-DCopper {
    $bmp = New-Object System.Drawing.Bitmap 400, 300
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::White)

    $greenPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(0, 135, 90)), [float]8
    $bluePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(28, 63, 96)), [float]8
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0, 135, 90))
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 63, 96))
    $grayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(107, 114, 128))

    $g.DrawBezier($greenPen, 45, 130, 105, 90, 230, 88, 280, 115)

    $fontD = New-Object System.Drawing.Font "Arial", [float]38, [System.Drawing.FontStyle]::Bold
    $g.DrawString("D", $fontD, $greenBrush, [float]40, [float]125)
    $g.DrawString("COPPER", $fontD, $blueBrush, [float]85, [float]125)

    $g.DrawBezier($bluePen, 190, 190, 250, 205, 320, 200, 375, 178)

    $fontSub = New-Object System.Drawing.Font "Arial", [float]9, [System.Drawing.FontStyle]::Bold
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("F I O S   E   C A B O S   E L É T R I C O S", $fontSub, $grayBrush, [float]200, [float]215, $sf)

    $bmp.Save("$outputDir\dcopper.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Generate-Sallve {
    $bmp = New-Object System.Drawing.Bitmap 400, 400
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::White)

    $greenColor = [System.Drawing.Color]::FromArgb(45, 90, 63)
    $greenPen = New-Object System.Drawing.Pen $greenColor, [float]7
    $greenBrush = New-Object System.Drawing.SolidBrush $greenColor

    $g.DrawEllipse($greenPen, 115, 50, 170, 170)
    $g.DrawLine($greenPen, 200, 160, 200, 105)
    $g.DrawLine($greenPen, 200, 160, 160, 190)
    $g.DrawLine($greenPen, 200, 160, 240, 190)

    $g.FillEllipse($greenBrush, 190, 68, 20, 20)
    $g.FillEllipse($greenBrush, 164, 78, 18, 18)
    $g.FillEllipse($greenBrush, 218, 78, 18, 18)
    $g.FillEllipse($greenBrush, 140, 100, 18, 18)
    $g.FillEllipse($greenBrush, 242, 100, 18, 18)

    $fontSallve = New-Object System.Drawing.Font "Georgia", [float]42, [System.Drawing.FontStyle]::Bold
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("Sallve", $fontSallve, $greenBrush, [float]200, [float]245, $sf)

    $fontAmb = New-Object System.Drawing.Font "Arial", [float]12, [System.Drawing.FontStyle]::Bold
    $graySub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(75, 107, 86))
    $g.DrawString("A M B I E N T A L", $fontAmb, $graySub, [float]200, [float]315, $sf)

    $bmp.Save("$outputDir\sallve-ambiental.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Generate-CopperGroup {
    $bmp = New-Object System.Drawing.Bitmap 400, 400
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::White)

    $greenPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(52, 104, 74)), [float]12
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 104, 74))
    $grayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(107, 114, 128))

    $g.DrawRectangle($greenPen, 135, 95, 120, 120)
    $g.FillEllipse($grayBrush, 270, 85, 26, 26)

    $fontWord = New-Object System.Drawing.Font "Arial", [float]22, [System.Drawing.FontStyle]::Bold
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("COPPER GROUP", $fontWord, $greenBrush, [float]200, [float]260, $sf)

    $fontTag = New-Object System.Drawing.Font "Arial", [float]10, [System.Drawing.FontStyle]::Regular
    $g.DrawString("Sustentabilidade que move o mundo.", $fontTag, $grayBrush, [float]200, [float]300, $sf)

    $bmp.Save("$outputDir\copper-group.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Generate-AFLocacoes
Generate-DCopper
Generate-Sallve
Generate-CopperGroup

Write-Output "ALL PNG LOGOS GENERATED SUCCESSFULLY!"
