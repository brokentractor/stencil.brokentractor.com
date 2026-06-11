"""Pin Kits step 2: loose second pass for callouts the main pass missed.
Usage: python _pinkit_extra.py <cid>
Reads {cid}-readings.json (idx->ref from main strips) to know what's already found,
emits {cid}-x*.png strips of NEW ring candidates."""
import json, os, sys
import numpy as np, cv2

cid = sys.argv[1]
WORK = "_refmap-work"
img = cv2.imread(f"{WORK}/cv/images/{cid}.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
H, W = gray.shape
blur = cv2.medianBlur(gray, 3)

circles = json.load(open(f"{WORK}/cv/detect/{cid}-circles.json", encoding="utf-8"))
readings = json.load(open(f"{WORK}/cv/detect/{cid}-readings.json", encoding="utf-8"))
known = [(circles[int(i)]["x_px"], circles[int(i)]["y_px"]) for i in readings]

def ringish(cx, cy, r):
    darks = []
    for t in np.linspace(0, 2*np.pi, 36):
        vals = [gray[min(H-1,max(0,int(cy+(r+d)*np.sin(t)))), min(W-1,max(0,int(cx+(r+d)*np.cos(t))))] for d in range(-5,6)]
        darks.append(min(vals))
    if np.mean([v < 110 for v in darks]) < 0.75: return False
    rr = max(3, int(r*0.45))
    inner = gray[max(0,int(cy)-rr):int(cy)+rr, max(0,int(cx)-rr):int(cx)+rr]
    return inner.size > 0 and inner.mean() >= 125

allc = []
for p2 in (25, 18, 13):
    c = cv2.HoughCircles(blur, cv2.HOUGH_GRADIENT, dp=1.2, minDist=35,
                         param1=100, param2=p2, minRadius=24, maxRadius=60)
    if c is not None:
        allc.extend([tuple(map(float, x)) for x in c[0]])

new = [c for c in allc
       if not any((c[0]-kx)**2 + (c[1]-ky)**2 < 70**2 for kx, ky in known)
       and ringish(*c)]
new.sort(key=lambda t: -t[2])
ded = []
for cx, cy, r in new:
    if all((cx-kx)**2 + (cy-ky)**2 > (0.7*(r+kr))**2 for kx, ky, kr in ded):
        ded.append((cx, cy, r))
ded.sort(key=lambda t: (round(t[1]/120), t[0]))
print(f"new ring candidates: {len(ded)}")
json.dump([{"x_px": c[0], "y_px": c[1], "r_px": c[2]} for c in ded],
          open(f"{WORK}/cv/detect/{cid}-extra.json", "w"), indent=1)

cell, cols = 170, 6
for s in range(0, len(ded), cols):
    chunk = ded[s:s+cols]
    canvas = np.full((cell + 36, cols * cell, 3), 255, np.uint8)
    for j, (cx, cy, r) in enumerate(chunk):
        pad = int(r * 1.2)
        y0, y1 = max(0, int(cy)-pad), min(H, int(cy)+pad)
        x0, x1 = max(0, int(cx)-pad), min(W, int(cx)+pad)
        crop = img[y0:y1, x0:x1]
        if crop.size == 0: continue
        crop = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_CUBIC)
        canvas[0:cell, j*cell:(j+1)*cell] = crop
        cv2.putText(canvas, f"x{s+j}", (j*cell + 8, cell + 28),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.imwrite(f"{WORK}/cv/strips/{cid}-x{s//cols}.png", canvas)
print("extra strips written")
