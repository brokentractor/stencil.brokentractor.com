// Phase 2: map custom template filenames -> BC category id + URL via v2 categories API
// (v2 exposes layout_file; v3 does not)
const fs = require('fs');

const STORE_HASH = 'knh0cnq2u8';
const ACCESS_TOKEN = '7os09b2t3zkos4lew79xywcg2lsnwla';
const BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v2/categories`;

async function fetchPage(page) {
    const res = await fetch(`${BASE}?limit=250&page=${page}`, {
        headers: { 'X-Auth-Token': ACCESS_TOKEN, 'Accept': 'application/json' },
    });
    if (res.status === 204) return [];
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}

(async () => {
    const all = [];
    for (let page = 1; page < 40; page++) {
        const batch = await fetchPage(page);
        if (!batch.length) break;
        all.push(...batch);
        process.stdout.write(`page ${page}: ${batch.length} categories (total ${all.length})\n`);
    }

    const withLayout = all.filter(c => c.layout_file && !/^category\.html$/i.test(c.layout_file));
    const mapping = withLayout.map(c => ({
        category_id: c.id,
        name: c.name,
        url: c.custom_url || c.url || null,
        layout_file: c.layout_file,
    }));

    fs.mkdirSync('_refmap-work', { recursive: true });
    fs.writeFileSync('_refmap-work/category-layouts.json', JSON.stringify(mapping, null, 2));
    console.log(`\nTotal categories: ${all.length}`);
    console.log(`With custom layout_file: ${withLayout.length}`);
    const counts = {};
    for (const m of mapping) counts[m.layout_file] = (counts[m.layout_file] || 0) + 1;
    const dupes = Object.entries(counts).filter(([, n]) => n > 1);
    console.log(`Layout files assigned to >1 category: ${dupes.length}`);
    for (const [f, n] of dupes.slice(0, 10)) console.log(`  ${n}x ${f}`);
})();
