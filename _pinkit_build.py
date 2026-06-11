"""Pin Kits step 3: build the ref-map JSON from final circle positions.
Usage: python _pinkit_build.py <cid>
Reads {cid}-final-circles.json [{ref,x_px,y_px,r_px}], joins vs REFID rows,
writes ref-maps/{cid}.json + audit overlay."""
import json, re, sys
from collections import defaultdict
import cv2

cid = sys.argv[1]
WORK = "_refmap-work"
cats = {c["category_id"]: c for c in json.load(open(f"{WORK}/unmapped-categories.json", encoding="utf-8"))}
cat = cats[int(cid)]
img = cv2.imread(f"{WORK}/cv/images/{cid}.png")
H, W = img.shape[:2]

spots_px = json.load(open(f"{WORK}/cv/detect/{cid}-final-circles.json", encoding="utf-8"))

by_ref = defaultdict(list)
for r in cat["ref_rows"]:
    by_ref[r["ref"]].append(r)

def rows_for(ref):
    rows = list(by_ref.get(ref, []))
    for tref, trs in by_ref.items():
        if re.fullmatch(re.escape(ref) + r"[A-Za-z]", tref):
            rows.extend(trs)
    return rows

spots, used, skipped = [], set(), []
for s in spots_px:
    ref = s["ref"]
    rows = rows_for(ref)
    if len(rows) == 1:
        href, kind, label = rows[0]["url"], "product", rows[0]["name"]
    elif len(rows) > 1:
        href, kind, label = "#" + rows[0]["ref"], "anchor", f"{len(rows)} matching parts"
    else:
        skipped.append(ref); continue
    spots.append({"ref": ref,
        "x": round(s["x_px"]/W*100, 2), "y": round(s["y_px"]/H*100, 2),
        "r": round(s["r_px"]/W*100, 2), "label": label, "href": href, "kind": kind})
    for r in rows: used.add(r["ref"])

table_only = sorted(r for r in (set(by_ref) - used) if r.lower() != "xx")
payload = {"image": cat["images"][0], "category": cat["name"], "template": "cv-pipeline",
           "hotspots": sorted(spots, key=lambda s: (len(s["ref"]), s["ref"]))}
for path in (f"{WORK}/ref-maps/{cid}.json", f"assets/ref-maps/{cid}.json"):
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

ov = img.copy()
for h in payload["hotspots"]:
    cx, cy = int(h["x"]/100*W), int(h["y"]/100*H)
    r = int(h["r"]/100*W)
    cv2.circle(ov, (cx, cy), r+10, (0, 200, 0), 8)
cv2.imwrite(f"{WORK}/cv/strips/{cid}-audit.png", cv2.resize(ov, (1300, int(1300*H/W))))

print(f"[{cid}] {cat['name']}")
print(f"  hotspots={len(spots)} product={sum(1 for s in spots if s['kind']=='product')} rowjump={sum(1 for s in spots if s['kind']=='anchor')}")
print(f"  skipped-circles(no products)={skipped}")
print(f"  table-refs-without-circle={table_only}")
