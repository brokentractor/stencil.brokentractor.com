import $ from 'jquery';

/*
 * Selector layout for option buttons (Chance's kit selector, Nov 2026): numbered questions, cards with a
 * subtitle and a hover "i" tip, and a summary box above Add to Cart.
 * Only runs on products that carry Selector* custom fields (rendered in #bt-selector-data); every other
 * product with options keeps the normal buttons. Not every optioned product is a kit, so the box wording
 * is per product:
 *   SelectorModel             = "580 Super M"                       (first part of the summary line)
 *   SelectorBoxTitle          = "Your Kit"                          (default "Your Selection")
 *   SelectorNoun              = "your kit"                          (default "your selection")
 *   SelectorHelp              = "Not sure? Call (800) 909-7060 with your serial number."  (phone number is linked)
 *   SelectorQ:<option name>   = "Which series?"                     (question text)
 *   SelectorV:<value label>   = "Title|Subtitle|Hover tip"          (one per button; **x** in the subtitle = bold)
 */
const PHONE = '(800) 909-7060';
export default function optionSelector() {
    // only Selector* fields switch this on; every product has other custom fields (FitsModel, etc.)
    const $data = $('#bt-selector-data [data-n^="Selector"]');
    const $fields = $('#productoptions .form-field[data-product-attribute="set-rectangle"]');
    if (!$data.length || !$fields.length) return;

    const fields = {};
    $data.each((i, el) => { fields[el.getAttribute('data-n')] = el.getAttribute('data-v'); });

    $fields.each((i, field) => {
        const $field = $(field).addClass('bt-sel');
        const $label = $field.children('.form-label').first();
        const name = $.trim($label.clone().children().remove().end().text()).replace(/:$/, '');
        $label.addClass('bt-sel-q').empty().append(
            $('<span class="bt-sel-num">').text(i + 1),
            $('<span class="bt-sel-qtext">').text(fields[`SelectorQ:${name}`] || name),
        );

        $field.find('label.form-option').each((j, opt) => {
            const $variant = $(opt).find('.form-option-variant');
            const label = $.trim($variant.text());
            const info = fields[`SelectorV:${label}`];
            if (!info) return;

            const [title, sub, tip] = info.split('|').map($.trim);
            $variant.empty().addClass('bt-sel-card');
            if (tip) {
                $variant.append($('<span class="bt-sel-info" tabindex="0" role="button" aria-label="More information">').append(
                    $('<span class="bt-sel-i" aria-hidden="true">').text('i'),
                    $('<span class="bt-sel-tip" role="tooltip">').text(tip),
                ));
            }
            $variant.append($('<span class="bt-sel-title">').text(title || label));
            // **text** in the subtitle is shown bold, e.g. "S/N starts with **JJG0**"
            if (sub) {
                const $sub = $('<span class="bt-sel-sub">');
                sub.split(/\*\*(.+?)\*\*/).forEach((part, k) => {
                    if (part) $sub.append(k % 2 ? $('<strong>').text(part) : document.createTextNode(part));
                });
                $variant.append($sub);
            }
            $(opt).attr('data-bt-title', title || label);
        });
    });

    // Summary box, inside the cart form just above the quantity / Add to Cart row
    const $box = $(`
        <div class="bt-sel-kit">
            <div class="bt-sel-kit-head"></div>
            <div class="bt-sel-kit-row">
                <div>
                    <div class="bt-sel-kit-name"></div>
                    <div class="bt-sel-kit-sku"></div>
                </div>
                <div class="bt-sel-kit-price"></div>
            </div>
            <div class="bt-sel-kit-help"></div>
        </div>`);
    $box.find('.bt-sel-kit-head').text(fields.SelectorBoxTitle || 'Your Selection');
    const help = fields.SelectorHelp || `Questions? Call ${PHONE}.`;
    help.split(PHONE).forEach((part, k) => {
        if (k) $box.find('.bt-sel-kit-help').append($('<a href="tel:18009097060">').text(PHONE));
        $box.find('.bt-sel-kit-help').append(document.createTextNode(part));
    });
    $('#productoptions').closest('form').find('.form-field--increments').first().before($box);

    const model = fields.SelectorModel || '';
    const noun = fields.SelectorNoun || 'your selection';
    const update = () => {
        const picked = $fields.map((i, field) => $(field).find('.form-radio:checked + label.form-option').attr('data-bt-title')).get();
        const done = picked.length === $fields.length;
        $box.toggleClass('is-ready', done);
        $box.find('.bt-sel-kit-name').text(done ? [model].concat(picked).filter(Boolean).join(' · ') : `Answer the ${$fields.length > 1 ? 'questions' : 'question'} above to see ${noun}.`);
        $box.find('.bt-sel-kit-sku').text(done ? `Part # ${$.trim($('#partnum-text').text())}` : '');
        // a kit with purchasing turned off (e.g. Powershift until it's priced) carries a $999 placeholder
        const callOnly = done && $('#form-action-addToCart').prop('disabled');
        $box.find('.bt-sel-kit-price').text(callOnly ? 'Call for price' : (done ? $.trim($('.productView-price [data-product-price-without-tax]').first().text()) : ''));
        $('.productView-price').toggleClass('bt-sel-hide', !!callOnly);
    };
    // SKU and price arrive by ajax after a pick, so follow those elements too
    $fields.on('change', '.form-radio', update);
    const observer = new MutationObserver(update);
    $('#partnum-text, .productView-price [data-product-price-without-tax]').each((i, el) => {
        observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
    $('#form-action-addToCart').each((i, el) => observer.observe(el, { attributes: true, attributeFilter: ['disabled'] }));
    update();
}
