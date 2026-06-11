"""Pin Kits family pipeline, step 1: native-res detection + reading strips.
Usage: python _pinkit_detect.py <category_id>"""
import json, os, sys
import numpy as np, cv2

cid = sys.argv[1]
WORK = "_refmap-work"
img = cv2.imread(f"{WORK}/cv/images/{cid}.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
H, W = gray.shape
blur = cv2.medianBlur(gray, 5)

def band_ok(cx, cy, r):
    darks = []
    for t in np.linspace(0, 2*np.pi, 32):
        vals = []
        for dr in range(-6, 7):
            x, y = int(cx + (r+dr)*np.cos(t)), int(cy + (r+dr)*np.sin(t))
            if 0 <= x < W and 0 <= y < H:
                vals.append(gray[y, x])
        if vals: darks.append(min(vals))
    if not darks: return False
    if np.mean([d < 100 for d in darks]) < 0.75: return False
    rr = max(3, int(r*0.4))
    cyi, cxi = int(cy), int(cx)
    inner = gray[max(0,cyi-rr):cyi+rr, max(0,cxi-rr):cxi+rr]
    return inner.size > 0 and inner.mean() >= 120

allc = []
for p2 in (55, 45, 35, 28, 22):
    c = cv2.HoughCircles(blur, cv2.HOUGH_GRADIENT, dp=1.2, minDist=40,
                         param1=120, param2=p2, minRadius=22, maxRadius=70)
    if c is not None:
        allc.extend([tuple(map(float, x)) for x in c[0]])

kept = [c for c in allc if band_ok(*c)]
kept.sort(key=lambda t: -t[2])
ded = []
for cx, cy, r in kept:
    if all((cx-kx)**2 + (cy-ky)**2 > (0.7*(r+kr))**2 for kx, ky, kr in ded):
        ded.append((cx, cy, r))
ded.sort(key=lambda t: (round(t[1]/120), t[0]))
print(f"image {W}x{H}; detections: {len(ded)}")

json.dump([{"x_px": c[0], "y_px": c[1], "r_px": c[2]} for c in ded],
          open(f"{WORK}/cv/detect/{cid}-circles.json", "w"), indent=1)

cell, cols = 170, 6
os.makedirs(f"{WORK}/cv/strips", exist_ok=True)
nstrips = 0
for s in range(0, len(ded), cols):
    chunk = ded[s:s+cols]
    canvas = np.full((cell + 36, cols * cell, 3), 255, np.uint8)
    for j, (cx, cy, r) in enumerate(chunk):
        pad = int(r * 1.15)
        y0, y1 = max(0, int(cy)-pad), min(H, int(cy)+pad)
        x0, x1 = max(0, int(cx)-pad), min(W, int(cx)+pad)
        crop = img[y0:y1, x0:x1]
        if crop.size == 0: continue
        crop = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_CUBIC)
        canvas[0:cell, j*cell:(j+1)*cell] = crop
        cv2.putText(canvas, f"idx {s+j}", (j*cell + 8, cell + 28),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.imwrite(f"{WORK}/cv/strips/{cid}-s{s//cols}.png", canvas)
    nstrips += 1
print(f"{nstrips} strips written")

cats = {c["category_id"]: c for c in json.load(open(f"{WORK}/unmapped-categories.json", encoding="utf-8"))}
refs = sorted({r["ref"] for r in cats[int(cid)]["ref_rows"]})
print(f"table refs ({len(refs)}): {','.join(refs)}")
