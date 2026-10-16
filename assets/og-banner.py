from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630
PAPER=(246,241,231); INK=(23,18,11); WHITE=(255,255,255)
LIME=(200,243,29); PINK=(255,77,141); BLUE=(62,166,255); SUN=(255,201,64); VIO=(157,137,255)
GREEN=(46,169,15); LGREEN=(122,220,62)

FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FM="/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def font(p, s): return ImageFont.truetype(p, s)

im = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(im)

def halftone(d, bbox, step=26, r=2, alpha_dot=(23,18,11)):
    x0,y0,x1,y1_bbox = bbox
    for y in range(y0, min(y1_bbox, H), step):
        row = step//2 if (y//step)%2 else 0
        for x in range(x0+row, min(x1, W), step):
            d.ellipse((x-r, y-r, x+r, y+r), fill=(234,226,212))
halftone(d, (0,0,W,H))

def star(d, cx, cy, R, fill):
    pts=[]
    for i in range(10):
        rr = R*0.45 if i%2 else R
        a = math.pi/5*i - math.pi/2
        pts.append((cx+math.cos(a)*rr, cy+math.sin(a)*rr))
    d.polygon(pts, fill=fill, outline=INK, width=4)
star(d, 92, 92, 72, SUN)

def dCircle(d, cx, cy, r, color, wd=5, seg=44, dash=0.62):
    for i in range(seg):
        a0 = 2*math.pi*i/seg; a1 = a0 + 2*math.pi*dash/seg
        d.arc((cx-r, cy-r, cx+r, cy+r), math.degrees(a0), math.degrees(a1), fill=color, width=wd)
dCircle(d, 720, 128, 58, PINK)

def wave(d, x, y, w, color, amp=16, n=4, wd=8):
    pts=[]
    seg = w/(n*2)
    for i in range(n*2+1):
        xx = x + i*seg
        yy = y + (amp if i%2 else -amp)* (1 if i>0 else 0.5)
        pts.append((xx, yy))
    # smooth through quadratic sampling
    out=[]
    for i in range(len(pts)-1):
        p0=pts[i]; p2=pts[i+1]
        pc=((p0[0]+p2[0])/2, (p0[1]+p2[1])/2 + (amp*1.1 if i%2==0 else -amp*1.1))
        for t in [j/8 for j in range(9)]:
            out.append(((1-t)**2*p0[0]+2*(1-t)*t*pc[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*pc[1]+t*t*p2[1]))
    d.line(out, fill=color, width=wd, joint="curve")
wave(d, 780, 470, 300, BLUE, amp=13, n=4)
wave(d, 470, 96, 240, BLUE, amp=11, n=3)

def plus(d, x, y, s, color=INK):
    d.text((x,y), "+", font=font(FB, s), fill=color, anchor="mm")
plus(d, 560, 470, 52, VIO)
plus(d, 762, 300, 46, INK)

# ── text block ──
x0 = 76
f1 = font(FB, 96)
f2 = font(FB, 150)
            # title lines
ya = 108
d.text((x0+6, ya+6), "GITHUB", font=f1, fill=(60,53,44))
d.text((x0, ya), "GITHUB", font=f1, fill=INK)
d.text((x0, ya+112), "WRAPPED", font=f1, fill=WHITE, stroke_width=5, stroke_fill=INK)
yb = ya + 96 + 96 + 26
d.text((x0+7, yb+7), "2026", font=f2, fill=SUN)
d.text((x0, yb), "2026", font=f2, fill=PINK)
# marker squiggle under 2026
bbox = d.textbbox((x0, yb), "2026", font=f2)
tw = bbox[2]-bbox[0]
pts=[]
for i in range(7):
    xx = x0 + tw*i/6
    yy = yb+158 + (8 if i%2 else -8)
    pts.append((xx, yy))
d.line(pts, fill=SUN, width=10, joint="curve")
f3 = font(FM, 27)
d.text((x0+2, 512), "your year in code —", font=f3, fill=INK)
d.text((x0+2, 548), "no login, just a username", font=f3, fill=INK)

# ── phone poster card (own layer, then rotate) ──
cw, ch = 400, 470
card = Image.new("RGBA", (cw+60, ch+60), (0,0,0,0))
dc = ImageDraw.Draw(card)
def rr(d, box, r, **kw): d.rounded_rectangle(box, radius=r, **kw)
rr(dc, (44, 44, 44+cw, 44+ch), 34, fill=INK)                       # hard shadow
rr(dc, (30, 30, 30+cw, 30+ch), 34, fill=WHITE, outline=INK, width=5)
# mini caption badge
rr(dc, (56, 56, 250, 92), 12, fill=INK)
dc.text((72, 64), "© WRAPPED", font=font(FM, 20), fill=LIME)
# contribution grid
gx, gy = 56, 116
import random; random.seed(26)
for row in range(5):
    for col in range(9):
        v = random.random()
        fill = GREEN if v>0.75 else LGREEN if v>0.45 else (220,238,208) if v>0.2 else (238,238,234)
        rr(dc, (gx+col*37, gy+row*37, gx+col*37+30, gy+row*37+30), 5, fill=fill, outline=INK if v>0.75 else None, width=2)
dc.text((56, 330), "4822", font=font(FB, 84), fill=INK)
# owl badge
ox, oy, orr = 330, 398, 62
dc.ellipse((ox-orr+8, oy-orr+8, ox+orr+8, oy+orr+8), fill=INK)
dc.ellipse((ox-orr, oy-orr, ox+orr, oy+orr), fill=LIME, outline=INK, width=5)
for ex in (-22, 22):
    dc.ellipse((ox+ex-17, oy-24, ox+ex+17, oy+10), fill=WHITE, outline=INK, width=4)
    dc.ellipse((ox+ex-6, oy-12, ox+ex+6, oy), fill=INK)
dc.polygon([(ox-8, oy+6), (ox+8, oy+6), (ox, oy+20)], fill=SUN, outline=INK)
dc.arc((ox-50, oy-52, ox+50, oy+52), 200, 340, fill=INK, width=4)
card = card.rotate(-7, expand=False, resample=Image.BICUBIC, center=((cw+60)//2,(ch+60)//2))
im.paste(card, (720, 60), card)

# ── bottom ticker strip ──
d.rectangle((0, H-52, W, H), fill=INK)
d.text((W//2, H-27), "hilsetapp.github.io/Wrapped-2026  ✦  no login  ✦  open source", font=font(FM, 24), fill=WHITE, anchor="mm")

# ── outer frame ──
d.rectangle((6, 6, W-6, H-6), outline=INK, width=4)

q = im.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
q.save("/home/user/wrapped-2026/assets/og-banner.png", "PNG", optimize=True)
import os; print("saved", os.path.getsize("/home/user/wrapped-2026/assets/og-banner.png")//1024, "KB")
