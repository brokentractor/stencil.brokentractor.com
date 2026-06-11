"""Detector v2: per-style detection.
- style "red-circle": HSV red ring mask (v1)
- style "black-circle": dark ring detection via HoughCircles on grayscale
- style "red-text": red pixel clusters (digit groups), no rings
Style is chosen per category by trying red rings first, then black circles,
then red text — keeping whichever yields a plausible count (>=3).
JD photo-callout categories are excluded (handled in a separate pass).
"""
import json, os
import numpy as np
import cv2

WORK = "_refmap-work"
CV = os.path.join(WORK, "cv")
cats = json.load(open(f"{WORK}/unmapped-categories.json", encoding="utf-8"))

# JD photo-callout categories (style 4) — skip in this pass
JD_CALLOUT = set()
for c in cats:
    if "Backhoe Hydraulic Cylinders" in c["name"] or "Cylinders" in c["name"]:
        JD_CALLOUT.add(c["category_id"])

def dedupe(found):
    found.sort(key=lambda t: -t[2])
    kept = []
    for cx, cy, r in found:
        if all((cx - kx) ** 2 + (cy - ky) ** 2 > (0.8 * (r + kr)) ** 2 for kx, ky, kr in kept):
            kept.append((cx, cy, r))
    kept.sort(key=lambda t: (round(t[1] / 40), t[0]))
    return kept

def detect_red_rings(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.bitwise_or(
        cv2.inRange(hsv, (0, 70, 60), (12, 255, 255)),
        cv2.inRange(hsv, (168, 70, 60), (180, 255, 255)))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    H, W = img.shape[:2]
    found = []
    for c in contours:
        area = cv2.contourArea(c)
        if area < 80:
            continue
        (cx, cy), r = cv2.minEnclosingCircle(c)
        if r < 6 or r > min(W, H) * 0.08:
            continue
        if area / (np.pi * r * r) < 0.15:
            continue
        cx_i, cy_i, rr = int(cx), int(cy), max(2, int(r * 0.45))
        center = mask[max(0, cy_i - rr):cy_i + rr, max(0, cx_i - rr):cx_i + rr]
        if center.size and center.mean() / 255.0 > 0.85:
            continue
        found.append((float(cx), float(cy), float(r)))
    return dedupe(found)

def detect_black_circles(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)
    H, W = img.shape[:2]
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2,
                               minDist=18, param1=120, param2=33,
                               minRadius=8, maxRadius=int(min(W, H) * 0.06))
    if circles is None:
        return []
    found = []
    for cx, cy, r in circles[0]:
        cx_i, cy_i, r_i = int(cx), int(cy), int(r)
        # ring darkness: sample the circle perimeter; must be mostly dark
        pts = [(int(cx + r * np.cos(t)), int(cy + r * np.sin(t)))
               for t in np.linspace(0, 2 * np.pi, 24)]
        vals = [gray[y, x] for x, y in pts if 0 <= x < W and 0 <= y < H]
        if not vals or np.mean(vals) > 120:
            continue
        # interior should be light (white fill w/ number)
        rr = max(2, int(r * 0.45))
        inner = gray[max(0, cy_i - rr):cy_i + rr, max(0, cx_i - rr):cx_i + rr]
        if inner.size == 0 or inner.mean() < 120:
            continue
        found.append((float(cx), float(cy), float(r)))
    return dedupe(found)

def detect_red_text(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.bitwise_or(
        cv2.inRange(hsv, (0, 70, 60), (12, 255, 255)),
        cv2.inRange(hsv, (168, 70, 60), (180, 255, 255)))
    # cluster nearby red digit strokes into number groups
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    H, W = img.shape[:2]
    found = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w * h < 60 or h < 7 or h > H * 0.08 or w > W * 0.1:
            continue
        found.append((x + w / 2.0, y + h / 2.0, max(w, h) / 2.0))
    found.sort(key=lambda t: (round(t[1] / 40), t[0]))
    return found

summary = []
for cat in cats:
    cid = cat["category_id"]
    if cid in JD_CALLOUT or not cat["images"]:
        continue
    img_path = os.path.join(CV, "images", f"{cid}.png")
    if not os.path.exists(img_path):
        continue
    img = cv2.imread(img_path)
    H, W = img.shape[:2]

    attempts = [
        ("red-circle", detect_red_rings(img)),
        ("black-circle", detect_black_circles(img)),
        ("red-text", detect_red_text(img)),
    ]
    expected = len(set(r["ref"] for r in cat["ref_rows"])) if cat["ref_rows"] else 0
    # pick style whose count is closest to expected (and >= 3)
    best_style, best = None, []
    for style, det in attempts:
        if len(det) < 3:
            continue
        if best_style is None or abs(len(det) - expected) < abs(len(best) - expected):
            best_style, best = style, det

    det = {
        "category_id": cid, "name": cat["name"], "url": cat["url"],
        "image": cat["images"][0], "img_w": W, "img_h": H,
        "style": best_style,
        "circles": [
            {"i": i, "x_px": round(cx, 1), "y_px": round(cy, 1), "r_px": round(r, 1),
             "x": round(cx / W * 100, 2), "y": round(cy / H * 100, 2),
             "r": round(r / W * 100, 2)}
            for i, (cx, cy, r) in enumerate(best)
        ],
    }
    json.dump(det, open(os.path.join(CV, "detect", f"{cid}.json"), "w", encoding="utf-8"), indent=1)

    proof = img.copy()
    for i, (cx, cy, r) in enumerate(best):
        cv2.circle(proof, (int(cx), int(cy)), int(r) + 4, (255, 190, 0), 2)
        cv2.putText(proof, str(i), (int(cx) + int(r) + 6, int(cy) + 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 200), 2)
    cv2.imwrite(os.path.join(CV, "proof", f"{cid}.png"), proof)

    if best:
        cell = 96
        cols = min(10, len(best))
        rows = (len(best) + cols - 1) // cols
        canvas = np.full((rows * (cell + 24), cols * cell, 3), 255, np.uint8)
        for i, (cx, cy, r) in enumerate(best):
            pad = int(max(r * 1.3, 18))
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

    summary.append((cid, cat["name"][:42], best_style, len(best), expected))
    print(f"cat {cid} {cat['name'][:42]:44} style={str(best_style):13} detected={len(best):3} expectedRefs~{expected}")
