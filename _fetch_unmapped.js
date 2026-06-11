// Phase A: for the 50 categories assigned refid-table, fetch descriptions
// and product REFID data needed to build hotspot maps.
const fs = require('fs');

const STORE_HASH = 'knh0cnq2u8';
const ACCESS_TOKEN = '7os09b2t3zkos4lew79xywcg2lsnwla';
const V2 = `https://api.bigcommerce.com/stores/${STORE_HASH}/v2`;
const V3 = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;
const HEADERS = { 'X-Auth-Token': ACCESS_TOKEN, 'Accept': 'application/json' };

async function getJson(url) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}: ${await res.text()}`);
    return res.json();
}

(async () => {
    const layouts = JSON.parse(fs.readFileSync('_refmap-work/category-layouts.json', 'utf8'));
    const refidCats = layouts.filter(c => /^refid-table(\.html)?$/i.test(c.layout_file.trim()));
    console.log(`refid-table categories: ${refidCats.length}`);

    const out = [];
    for (const cat of refidCats) {
        // v2 category for description
        const c = await getJson(`${V2}/categories/${cat.category_id}`);
        const desc = (c && c.description) || '';
        const imgs = [...desc.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);

        // products in this category with custom fields (REFID)
        let products = [];
        let page = 1;
        while (true) {
            const resp = await getJson(
                `${V3}/catalog/products?categories:in=${cat.category_id}&include=custom_fields&limit=250&page=${page}`);
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
                    visible: p.is_visible,
                });
            }
        }

        out.push({
            category_id: cat.category_id,
            name: cat.name,
            url: cat.url,
            images: imgs,
            product_count: products.length,
            ref_rows: refRows,
        });
        process.stdout.write(
            `cat ${cat.category_id} "${cat.name}": imgs=${imgs.length} products=${products.length} refRows=${refRows.length}\n`);
    }

    fs.writeFileSync('_refmap-work/unmapped-categories.json', JSON.stringify(out, null, 1));
    const withImg = out.filter(o => o.images.length);
    const withRefs = out.filter(o => o.ref_rows.length);
    console.log(`\nSummary: ${out.length} categories | with description image: ${withImg.length} | with REFID rows: ${withRefs.length}`);
})();
