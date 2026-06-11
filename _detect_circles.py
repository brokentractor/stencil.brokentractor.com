"""Phase B: download diagram images for unmapped categories, detect red numbered
circles, emit per-category detection data + crop montages for number reading +
annotated proof images.

Outputs in _refmap-work/cv/:
  images/<catid>.png          downloaded diagram
  detect/<catid>.json         detected circles (px + %), no numbers yet
  montage/<catid>.png         indexed crops of each circle for vision number-reading
  proof/<catid>.png           diagram with detected circles outlined + index labels
"""
import json, os, io, urllib.request
import numpy as np
import cv2

WORK = "_refmap-work"
CV = os.path.join(WORK, "cv")
for sub in ("images", "detect", "montage", "proof"):
    os.makedirs(os.path.join(CV, sub), exist_ok=True)

cats = json.load(open(f"{WORK}/unmapped-categories.json", encoding="utf-8"))

def download(url, path):
    if os.path.exists(path):
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        arr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return False
        cv2.imwrite(path, img)
        return True
    except Exception:
        return False

def detect_red_circles(img):
    """Find red ring circles. Returns list of (cx, cy, r)."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # red wraps the hue axis
    m1 = cv2.inRange(hsv, (0, 70, 60), (12, 255, 255))
    m2 = cv2.inRange(hsv, (168, 70, 60), (180, 255, 255))
    mask = cv2.bitwise_or(m1, m2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    found = []
    H, W = img.shape[:2]
    for c in contours:
        area = cv2.contourArea(c)
        if area < 80:
            continue
        (cx, cy), r = cv2.minEnclosingCircle(c)
        if r < 6 or r > min(W, H) * 0.08:
            continue
        # circularity: contour area vs enclosing circle area (ring -> moderate fill)
        circ_area = np.pi * r * r
        fill = area / circ_area
        if fill < 0.15:
            continue
        # ring check: center should be mostly NOT red (white fill with number)
        cx_i, cy_i = int(cx), int(cy)
        rr = max(2, int(r * 0.45))
        y0, y1 = max(0, cy_i - rr), min(H, cy_i + rr)
        x0, x1 = max(0, cx_i - rr), min(W, cx_i + rr)
        center_red = mask[y0:y1, x0:x1].mean() / 255.0
        if center_red > 0.85:
            continue  # solid red blob, not a ring with white center
        found.append((float(cx), float(cy), float(r)))
    # dedupe overlapping detections
    found.sort(key=lambda t: -t[2])
    kept = []
    for cx, cy, r in found:
        if all((cx - kx) ** 2 + (cy - ky) ** 2 > (0.8 * (r + kr)) ** 2 for kx, ky, kr in kept):
            kept.append((cx, cy, r))
    # reading order: top-to-bottom rows, then left-to-right
    kept.sort(key=lambda t: (round(t[1] / 40), t[0]))
    return kept

summary = []
for cat in cats:
    cid = cat["category_id"]
    if not cat["images"]:
        summary.append((cid, cat["name"], "NO-IMAGE", 0))
        continue
    img_url = cat["images"][0]
    img_path = os.path.join(CV, "images", f"{cid}.png")
    if not download(img_url, img_path):
        summary.append((cid, cat["name"], "DOWNLOAD-FAIL", 0))
        continue
    img = cv2.imread(img_path)
    H, W = img.shape[:2]
    circles = detect_red_circles(img)

    det = {
        "category_id": cid, "name": cat["name"], "url": cat["url"],
        "image": img_url, "img_w": W, "img_h": H,
        "circles": [
            {"i": i, "x_px": round(cx, 1), "y_px": round(cy, 1), "r_px": round(r, 1),
             "x": round(cx / W * 100, 2), "y": round(cy / H * 100, 2),
             "r": round(r / W * 100, 2)}
            for i, (cx, cy, r) in enumerate(circles)
        ],
    }
    json.dump(det, open(os.path.join(CV, "detect", f"{cid}.json"), "w", encoding="utf-8"), indent=1)

    # proof image: outline detections + index labels
    proof = img.copy()
    for i, (cx, cy, r) in enumerate(circles):
        cv2.circle(proof, (int(cx), int(cy)), int(r) + 4, (255, 190, 0), 2)
        cv2.putText(proof, str(i), (int(cx) + int(r) + 6, int(cy) + 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 200), 2)
    cv2.imwrite(os.path.join(CV, "proof", f"{cid}.png"), proof)

    # montage of crops for number reading
    if circles:
        cell = 96
        cols = min(10, len(circles))
        rows = (len(circles) + cols - 1) // cols
        canvas = np.full((rows * (cell + 24), cols * cell, 3), 255, np.uint8)
        for i, (cx, cy, r) in enumerate(circles):
            pad = int(r * 1.3)
            y0, y1 = max(0, int(cy) - pad), min(H, int(cy) + pad)
            x0, x1 = max(0, int(cx) - pad), min(W, int(cx) + pad)
            crop = img[y0:y1, x0:x1]
            if crop.size == 0:
                continue
            crop = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_CUBIC)
            rr, cc = divmod(i, cols)
            ytop = rr * (cell + 24)
            canvas[ytop:ytop + cell, cc * cell:(cc + 1) * cell] = crop
            cv2.putText(canvas, f"#{i}", (cc * cell + 4, ytop + cell + 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1)
        cv2.imwrite(os.path.join(CV, "montage", f"{cid}.png"), canvas)

    expected = len(set(r["ref"] for r in cat["ref_rows"])) if cat["ref_rows"] else 0
    summary.append((cid, cat["name"], "OK", len(circles)))
    print(f"cat {cid} {cat['name'][:45]:47} circles={len(circles):3}  refRows~{expected}")

print()
ok = [s for s in summary if s[2] == "OK"]
print(f"Detected on {len(ok)} categories; issues: {[s for s in summary if s[2] != 'OK']}")
