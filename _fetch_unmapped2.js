// Phase A (corrected): source category list from v3 custom-template-associations
// (the modern, authoritative system) instead of legacy v2 layout_file.
const fs = require('fs');

const STORE_HASH = 'knh0cnq2u8';
const TOKEN = 'hbhjvk2du2pvtdxicdk8myetef2yzin'; // themes-scope token
const V2 = `https://api.bigcommerce.com/stores/${STORE_HASH}/v2`;
const V3 = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;
const HEADERS = { 'X-Auth-Token': TOKEN, 'Accept': 'application/json' };

async function getJson(url) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.slice(0, 90)}`);
    return res.json();
}

(async () => {
    const assoc = JSON.parse(fs.readFileSync('_refmap-work/v3-template-associations.json', 'utf8'));
    const refidIds = assoc
        .filter(a => a.entity_type === 'category' && /^refid-table\.html$/i.test(a.file_name))
        .map(a => a.entity_id);
    console.log(`refid-table categories (modern system): ${refidIds.length}`);

    // Which already have a generated map from the old-template migration?
    const have = new Set(fs.readdirSync('assets/ref-maps').map(f => parseInt(f, 10)));
    const todo = refidIds.filter(id => !have.has(id));
    console.log(`already have JSON maps: ${refidIds.length - todo.length}; to analyze: ${todo.length}`);

    const out = [];
    for (const id of todo) {
        let name = '', url = '', desc = '';
        try {
            const c3 = await getJson(`${V3}/catalog/categories?id:in=${id}&limit=1`);
            const cat = c3 && c3.data && c3.data[0];
            if (!cat) { console.log(`  cat ${id}: NOT FOUND in v3`); continue; }
            name = cat.name;
            url = cat.custom_url ? cat.custom_url.url : null;
            desc = cat.description || '';
        } catch (e) { console.log(`  cat ${id}: ${e.message}`); continue; }

        const imgs = [...desc.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);

        let products = [], page = 1;
        while (true) {
            const resp = await getJson(
                `${V3}/catalog/products?categories:in=${id}&include=custom_fields&limit=250&page=${page}`);
            const data = (resp && resp.data) || [];
            products.push(...data);
            if (data.length < 250) break;
            page++;
        }
        const refRows = [];
        for (const p of products) {
            const ref = (p.custom_fields || []).find(f => f.name === 'REFID');
            if (ref && ref.value != null && String(ref.value).trim() !== '') {
                refRows.push({
                    ref: String(ref.value).trim(),
                    name: p.name,
                    url: p.custom_url ? p.custom_url.url : null,
                });
            }
        }
        out.push({ category_id: id, name, url, images: imgs, product_count: products.length, ref_rows: refRows });
        process.stdout.write(`cat ${id} "${name}": imgs=${imgs.length} products=${products.length} refRows=${refRows.length}\n`);
    }

    fs.writeFileSync('_refmap-work/unmapped-categories.json', JSON.stringify(out, null, 1));
    const withImg = out.filter(o => o.images.length);
    const withRefs = out.filter(o => o.ref_rows.length);
    console.log(`\nSummary: ${out.length} to map | with image: ${withImg.length} | with REFID rows: ${withRefs.length}`);
})();
