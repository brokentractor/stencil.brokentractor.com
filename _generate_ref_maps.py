"""Phase 3: generate /content/ref-maps/<category-id>.json files.

Input: _refmap-work/extracted.json + _refmap-work/template-to-category.json
Output: _refmap-work/ref-maps/<category-id>.json

Format:
{
  "image": "<cdn url>",
  "category": "<name>",          // informational
  "template": "<source file>",   // informational, provenance
  "hotspots": [
    { "ref": "3", "x": 12.34, "y": 45.67, "label": "O-Ring", "href": "/p/..", "kind": "product" }
  ]
}
x/y are percentages of image width/height (circle center / polygon centroid).
Empty-href hotspots are dropped. Relative hrefs kept relative (work on any domain).
"""
import json, os, re

WORK = "_refmap-work"
OUT = os.path.join(WORK, "ref-maps")
os.makedirs(OUT, exist_ok=True)

extracted = {r["template"]: r for r in json.load(open(f"{WORK}/extracted.json", encoding="utf-8"))}
t2c = json.load(open(f"{WORK}/template-to-category.json", encoding="utf-8"))

def relativize(href):
    return re.sub(r"^https?://(?:www\.)?brokentractor\.com", "", href or "")

written = 0
dropped_empty = 0
skipped_shapes = 0
report = []

for template, cats in t2c.items():
    r = extracted.get(template)
    if not r or r.get("error"):
        report.append(f"SKIP {template}: no extraction data")
        continue
    img_w, img_h = r["img_w"], r["img_h"]
    spots = []
    for h in r["hotspots"]:
        if h["kind"] == "empty":
            dropped_empty += 1
            continue
        coords = [c.strip() for c in h["coords_px"].split(",") if c.strip()]
        try:
            nums = [float(c) for c in coords]
        except ValueError:
            skipped_shapes += 1
            continue
        if h["shape"] == "circle" and len(nums) >= 3:
            cx, cy, rad = nums[0], nums[1], nums[2]
        elif h["shape"] == "poly" and len(nums) >= 6:
            xs, ys = nums[0::2], nums[1::2]
            cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
            rad = max(max(xs) - min(xs), max(ys) - min(ys)) / 2
        elif h["shape"] == "rect" and len(nums) == 4:
            cx, cy = (nums[0] + nums[2]) / 2, (nums[1] + nums[3]) / 2
            rad = max(abs(nums[2] - nums[0]), abs(nums[3] - nums[1])) / 2
        else:
            skipped_shapes += 1
            continue
        spots.append({
            "ref": h["ref"],
            "x": round(cx / img_w * 100, 2),
            "y": round(cy / img_h * 100, 2),
            "r": round(rad / img_w * 100, 2),  # radius as % of image width
            "label": h["label"],
            "href": relativize(h["href"]),
            "kind": h["kind"],
        })

    for cat in cats:  # 1:1 in practice
        payload = {
            "image": r["image"],
            "category": cat["name"],
            "template": template,
            "hotspots": spots,
        }
        path = os.path.join(OUT, f'{cat["category_id"]}.json')
        json.dump(payload, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
        written += 1

print(f"JSON files written: {written}")
print(f"Empty-href hotspots dropped: {dropped_empty}")
print(f"Unparseable shapes skipped: {skipped_shapes}")
total = sum(len(json.load(open(os.path.join(OUT, f), encoding='utf-8'))["hotspots"]) for f in os.listdir(OUT))
print(f"Total hotspots across all files: {total}")
for line in report:
    print(" ", line)
