"""Probe live pages of the 50 'refid-table' categories: which actually render
the refid template (marker: the 'Each number on the image is a "Ref #"' banner)."""
import json, urllib.request

cats = json.load(open('_refmap-work/unmapped-categories.json', encoding='utf-8'))
MARKER = 'Each number on the image is a'

live, not_live, errors = [], [], []
for c in cats:
    url = 'https://www.brokentractor.com' + c['url']
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US'})
        with urllib.request.urlopen(req, timeout=25) as r:
            html = r.read().decode('utf-8', errors='replace')
        if MARKER in html:
            live.append(c)
        else:
            not_live.append(c)
    except Exception as e:
        errors.append((c, str(e)[:60]))

print(f'ACTUALLY rendering refid-table live: {len(live)}')
for c in live:
    print(f"  {c['category_id']:5} {c['name'][:55]:57} img={'Y' if c['images'] else 'N'} refs={len(c['ref_rows'])}")
print(f'\nNOT rendering refid-table live (field set but not applied): {len(not_live)}')
for c in not_live:
    print(f"  {c['category_id']:5} {c['name'][:55]}")
print(f'\nErrors: {len(errors)}')
for c, e in errors:
    print(f"  {c['category_id']:5} {c['name'][:45]}: {e}")

json.dump([c['category_id'] for c in live], open('_refmap-work/live-refid-ids.json', 'w'))
