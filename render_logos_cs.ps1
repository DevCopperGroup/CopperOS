$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Drawing.Text;

public class LogoRenderer {
    public static void RenderAll(string outputDir) {
        System.IO.Directory.CreateDirectory(outputDir);
        RenderAF(outputDir + "\\af-locacoes.png");
        RenderDCopper(outputDir + "\\dcopper.png");
        RenderSallve(outputDir + "\\sallve-ambiental.png");
        RenderCopperGroup(outputDir + "\\copper-group.png");
    }

    public static void RenderAF(string path) {
        using (Bitmap bmp = new Bitmap(400, 400))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.White);

            using (Brush blue = new SolidBrush(Color.FromArgb(27, 108, 168))) {
                g.FillRectangle(blue, 180, 80, 150, 36);
                g.FillRectangle(blue, 210, 145, 105, 34);

                PointF[] pts = new PointF[] {
                    new PointF(65, 244),
                    new PointF(165, 244),
                    new PointF(185, 210),
                    new PointF(85, 210)
                };
                g.FillPolygon(blue, pts);
            }

            using (LinearGradientBrush copper = new LinearGradientBrush(
                new PointF(60, 80), new PointF(230, 240),
                Color.FromArgb(217, 119, 54), Color.FromArgb(140, 59, 20))) {
                
                PointF[] aOuter = new PointF[] {
                    new PointF(165, 80),
                    new PointF(60, 240),
                    new PointF(112, 240),
                    new PointF(145, 190),
                    new PointF(178, 240),
                    new PointF(230, 240)
                };
                using (GraphicsPath pathA = new GraphicsPath()) {
                    pathA.AddPolygon(aOuter);
                    g.FillPath(copper, pathA);
                }
            }

            using (Font font = new Font("Arial", 20, FontStyle.Bold))
            using (Brush textBrush = new SolidBrush(Color.FromArgb(184, 93, 38))) {
                StringFormat sf = new StringFormat { Alignment = StringAlignment.Center };
                g.DrawString("L O C A Ç Õ E S", font, textBrush, 200, 280, sf);
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }

    public static void RenderDCopper(string path) {
        using (Bitmap bmp = new Bitmap(400, 300))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.White);

            using (Pen greenPen = new Pen(Color.FromArgb(0, 135, 90), 8f))
            using (Pen bluePen = new Pen(Color.FromArgb(28, 63, 96), 8f))
            using (Brush green = new SolidBrush(Color.FromArgb(0, 135, 90)))
            using (Brush blue = new SolidBrush(Color.FromArgb(28, 63, 96)))
            using (Brush gray = new SolidBrush(Color.FromArgb(107, 114, 128))) {
                g.DrawBezier(greenPen, 45, 130, 105, 90, 230, 88, 280, 115);

                using (Font fontD = new Font("Arial", 42, FontStyle.Bold)) {
                    g.DrawString("D", fontD, green, 35, 115);
                    g.DrawString("COPPER", fontD, blue, 80, 115);
                }

                g.DrawBezier(bluePen, 190, 190, 250, 205, 320, 200, 375, 178);

                using (Font fontSub = new Font("Arial", 9.5f, FontStyle.Bold)) {
                    StringFormat sf = new StringFormat { Alignment = StringAlignment.Center };
                    g.DrawString("F I O S   E   C A B O S   E L É T R I C O S", fontSub, gray, 200, 215, sf);
                }
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }

    public static void RenderSallve(string path) {
        using (Bitmap bmp = new Bitmap(400, 400))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.White);

            Color greenColor = Color.FromArgb(45, 90, 63);
            using (Pen greenPen = new Pen(greenColor, 7f))
            using (Brush green = new SolidBrush(greenColor))
            using (Brush greenSub = new SolidBrush(Color.FromArgb(75, 107, 86))) {
                g.DrawEllipse(greenPen, 115, 50, 170, 170);

                g.DrawLine(greenPen, 200, 160, 200, 105);
                g.DrawLine(greenPen, 200, 160, 160, 190);
                g.DrawLine(greenPen, 200, 160, 240, 190);

                g.FillEllipse(green, 190, 68, 20, 20);
                g.FillEllipse(green, 164, 78, 18, 18);
                g.FillEllipse(green, 218, 78, 18, 18);
                g.FillEllipse(green, 140, 100, 18, 18);
                g.FillEllipse(green, 242, 100, 18, 18);

                using (Font fontS = new Font("Georgia", 44, FontStyle.Bold))
                using (Font fontA = new Font("Arial", 12, FontStyle.Bold)) {
                    StringFormat sf = new StringFormat { Alignment = StringAlignment.Center };
                    g.DrawString("Sallve", fontS, green, 200, 245, sf);
                    g.DrawString("A M B I E N T A L", fontA, greenSub, 200, 315, sf);
                }
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }

    public static void RenderCopperGroup(string path) {
        using (Bitmap bmp = new Bitmap(400, 400))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.White);

            Color greenColor = Color.FromArgb(52, 104, 74);
            using (Pen greenPen = new Pen(greenColor, 12f))
            using (Brush green = new SolidBrush(greenColor))
            using (Brush gray = new SolidBrush(Color.FromArgb(107, 114, 128))) {
                g.DrawRectangle(greenPen, 135, 95, 120, 120);
                g.FillEllipse(gray, 270, 85, 26, 26);

                using (Font fontWord = new Font("Arial", 22, FontStyle.Bold))
                using (Font fontTag = new Font("Arial", 10.5f, FontStyle.Regular)) {
                    StringFormat sf = new StringFormat { Alignment = StringAlignment.Center };
                    g.DrawString("COPPER GROUP", fontWord, green, 200, 260, sf);
                    g.DrawString("Sustentabilidade que move o mundo.", fontTag, gray, 200, 305, sf);
                }
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[LogoRenderer]::RenderAll("C:\Users\rauli\.gemini\antigravity-ide\scratch\copperos\public\logos")
Write-Output "SUCCESSFULLY CREATED ALL 4 PNGs VIA C#!"
