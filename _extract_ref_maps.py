"""Phase 1: Extract image-map data from the 110 custom category templates.

Output: _refmap-work/extracted.json — per-template:
  { template, image, img_w, img_h, dims_source, hotspots: [
      {shape, coords_px, ref, label, href, kind} ] }

kind: product | anchor | parts-request | category | empty | other
Dimensions: width/height attrs if present, else fetched from CDN image header.
"""
import json, re, glob, os, struct, urllib.request

OUT_DIR = "_refmap-work"
os.makedirs(OUT_DIR, exist_ok=True)

def image_dimensions_from_url(url):
    """Read just enough bytes of a PNG/JPEG/GIF to get dimensions."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            head = r.read(65536)
    except Exception as e:
        return None, None, f"fetch-error: {e}"
    # PNG
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        w, h = struct.unpack(">II", head[16:24])
        return w, h, "png-header"
    # GIF
    if head[:6] in (b"GIF87a", b"GIF89a"):
        w, h = struct.unpack("<HH", head[6:10])
        return w, h, "gif-header"
    # JPEG: walk segments
    if head[:2] == b"\xff\xd8":
        i = 2
        while i < len(head) - 9:
            if head[i] != 0xFF:
                i += 1
                continue
            marker = head[i + 1]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3):
                h, w = struct.unpack(">HH", head[i + 5:i + 9])
                return w, h, "jpeg-header"
            seglen = struct.unpack(">H", head[i + 2:i + 4])[0]
            i += 2 + seglen
        return None, None, "jpeg-no-sof"
    return None, None, "unknown-format"

def classify_href(h):
    h = (h or "").strip()
    if not h:
        return "empty"
    if h.startswith("#"):
        return "anchor"
    if "/p/" in h:
        return "product"
    if "parts-request" in h:
        return "parts-request"
    if "/c/" in h:
        return "category"
    return "other"

def parse_ref_label(alt):
    """'3 - O-Ring, Rear Axle Hub' -> ('3', 'O-Ring, Rear Axle Hub')
       '1A - Bucket Parts'        -> ('1A', 'Bucket Parts')
       '9'                        -> ('9', None)
       'Brake Friction Disc'      -> (None, 'Brake Friction Disc')"""
    s = (alt or "").strip()
    m = re.match(r"(\d+[A-Za-z]?)\s*[-–—]\s*(.+)", s)
    if m:
        return m.group(1), m.group(2).strip()
    if re.fullmatch(r"\d+[A-Za-z]?", s):
        return s, None
    return None, s or None

results = []
dim_cache = {}
skip = {"backhoe-information.html", "category-non-purchase-items.html",
        "category_tractor.html", "category_wschem.html", "information-template.html",
        "landing-lev1.html", "landing-lev2.html", "refid-table.html"}

for f in sorted(glob.glob("templates/pages/custom/category/*.html")):
    base = os.path.basename(f)
    if base in skip:
        continue
    src = open(f, encoding="utf-8").read()
    img_m = re.search(r'<img\s[^>]*usemap[^>]*>', src)
    if not img_m:
        results.append({"template": base, "error": "no usemap img"})
        continue
    img_tag = img_m.group(0)
    src_m = re.search(r'src="([^"]+)"', img_tag)
    w_m = re.search(r'width="(\d+)"', img_tag)
    h_m = re.search(r'height="(\d+)"', img_tag)
    image_url = src_m.group(1) if src_m else None

    if w_m and h_m:
        img_w, img_h, dims_source = int(w_m.group(1)), int(h_m.group(1)), "attrs"
    elif image_url:
        if image_url not in dim_cache:
            dim_cache[image_url] = image_dimensions_from_url(image_url)
        img_w, img_h, dims_source = dim_cache[image_url]
    else:
        img_w = img_h = None
        dims_source = "no-image"

    hotspots = []
    for a in re.findall(r"<area[^>]*>", src):
        coords_m = re.search(r'coords="([^"]*)"', a)
        shape_m = re.search(r'shape="([^"]*)"', a)
        href_m = re.search(r'href="([^"]*)"', a)
        alt_m = re.search(r'alt="([^"]*)"', a)
        title_m = re.search(r'title="([^"]*)"', a)
        coords = coords_m.group(1) if coords_m else ""
        shape = (shape_m.group(1) if shape_m else "").lower()
        href = href_m.group(1) if href_m else ""
        alt = alt_m.group(1) or (title_m.group(1) if title_m else "")
        ref, label = parse_ref_label(alt)
        hotspots.append({
            "shape": shape,
            "coords_px": coords,
            "ref": ref,
            "label": label,
            "href": href,
            "kind": classify_href(href),
        })

    results.append({
        "template": base,
        "image": image_url,
        "img_w": img_w,
        "img_h": img_h,
        "dims_source": dims_source,
        "hotspots": hotspots,
    })

with open(os.path.join(OUT_DIR, "extracted.json"), "w", encoding="utf-8") as fh:
    json.dump(results, fh, indent=2, ensure_ascii=False)

# Report
ok = [r for r in results if r.get("img_w") and r.get("hotspots")]
no_dims = [r for r in results if not r.get("error") and not r.get("img_w")]
errs = [r for r in results if r.get("error")]
total_spots = sum(len(r.get("hotspots", [])) for r in results)
no_ref = sum(1 for r in results for h in r.get("hotspots", []) if h["kind"] not in ("empty",) and not h["ref"])

print(f"Templates processed: {len(results)}")
print(f"  fully extracted (dims + hotspots): {len(ok)}")
print(f"  missing dimensions: {len(no_dims)}")
print(f"  errors: {len(errs)}")
print(f"Total hotspots: {total_spots}")
print(f"Hotspots with no parseable ref number: {no_ref}")
print()
for r in no_dims:
    print(f"  NO DIMS: {r['template']} ({r['dims_source']}) img={str(r.get('image'))[:80]}")
for r in errs:
    print(f"  ERROR:   {r['template']}: {r['error']}")
