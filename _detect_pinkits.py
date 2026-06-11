"""Tuned detector for the Pin Kits family (black ring callouts on white background).
Filter: dark ring + light interior + LIGHT ANNULUS around the ring (callouts float
on white; machine parts don't)."""
import json, os
import numpy as np
import cv2

WORK = "_refmap-work"
CV = os.path.join(WORK, "cv")
PIN_KITS = [4134, 4268, 4295, 4296, 4294, 4289, 4287, 4283, 4288, 4393, 4286]

cats = {c["category_id"]: c for c in json.load(open(f"{WORK}/unmapped-categories.json", encoding="utf-8"))}

def detect_black_callouts(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    H, W = img.shape[:2]
    blur = cv2.medianBlur(gray, 3)
    circles = cv2.HoughCircles(blur, cv2.HOUGH_GRADIENT, dp=1.2,
                               minDist=16, param1=120, param2=26,
                               minRadius=7, maxRadius=int(min(W, H) * 0.06))
    if circles is None:
        return []
    found = []
    for cx, cy, r in circles[0]:
        cx_i, cy_i, r_i = int(cx), int(cy), int(r)
        # 1) ring perimeter mostly dark
        pts = [(int(cx + r * np.cos(t)), int(cy + r * np.sin(t)))
               for t in np.linspace(0, 2 * np.pi, 28)]
        ring_vals = [gray[y, x] for x, y in pts if 0 <= x < W and 0 <= y < H]
        if not ring_vals or np.mean(ring_vals) > 110:
            continue
        # 2) interior light (white fill with digit)
        rr = max(2, int(r * 0.45))
        inner = gray[max(0, cy_i - rr):cy_i + rr, max(0, cx_i - rr):cx_i + rr]
        if inner.size == 0 or inner.mean() < 130:
            continue
        # over-detect; junk gets discarded at the number-reading step
        found.append((float(cx), float(cy), float(r)))
    # dedupe
    found.sort(key=lambda t: -t[2])
    kept = []
    for cx, cy, r in found:
        if all((cx - kx) ** 2 + (cy - ky) ** 2 > (0.8 * (r + kr)) ** 2 for kx, ky, kr in kept):
            kept.append((cx, cy, r))
    kept.sort(key=lambda t: (round(t[1] / 40), t[0]))
    return kept

for cid in PIN_KITS:
    cat = cats[cid]
    img = cv2.imread(os.path.join(CV, "images", f"{cid}.png"))
    H, W = img.shape[:2]
    circles = detect_black_callouts(img)

    det = {
        "category_id": cid, "name": cat["name"], "url": cat["url"],
        "image": cat["images"][0], "img_w": W, "img_h": H,
        "style": "black-callout",
        "circles": [
            {"i": i, "x_px": round(cx, 1), "y_px": round(cy, 1), "r_px": round(r, 1),
             "x": round(cx / W * 100, 2), "y": round(cy / H * 100, 2),
             "r": round(r / W * 100, 2)}
            for i, (cx, cy, r) in enumerate(circles)
        ],
    }
    json.dump(det, open(os.path.join(CV, "detect", f"{cid}.json"), "w", encoding="utf-8"), indent=1)

    proof = img.copy()
    for i, (cx, cy, r) in enumerate(circles):
        cv2.circle(proof, (int(cx), int(cy)), int(r) + 4, (255, 190, 0), 2)
        cv2.putText(proof, str(i), (int(cx) + int(r) + 5, int(cy) + 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 0, 200), 2)
    cv2.imwrite(os.path.join(CV, "proof", f"{cid}.png"), proof)

    # montage
    if circles:
        cell = 96
        cols = min(12, len(circles))
        rows = (len(circles) + cols - 1) // cols
        canvas = np.full((rows * (cell + 24), cols * cell, 3), 255, np.uint8)
        for i, (cx, cy, r) in enumerate(circles):
            pad = int(max(r * 1.25, 14))
            y0, y1 = max(0, int(cy) - pad), min(H, int(cy) + pad)
            x0, x1 = max(0, int(cx) - pad), min(W, int(cx) + pad)
            crop = img[y0:y1, x0:x1]
            if crop.size == 0:
                continue
            crop = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_CUBIC)
            rr2, cc2 = divmod(i, cols)
            ytop = rr2 * (cell + 24)
            canvas[ytop:ytop + cell, cc2 * cell:(cc2 + 1) * cell] = crop
            cv2.putText(canvas, f"#{i}", (cc2 * cell + 4, ytop + cell + 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1)
        cv2.imwrite(os.path.join(CV, "montage", f"{cid}.png"), canvas)

    refs = sorted({r["ref"] for r in cat["ref_rows"]})
    print(f"cat {cid} {cat['name'][:42]:44} detected={len(circles):3}  table-refs={len(refs)} ({','.join(refs[:8])}...)")
