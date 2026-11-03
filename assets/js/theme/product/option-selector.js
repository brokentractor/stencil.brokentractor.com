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
 *   SelectorShowIf:<option name> = "<value label>|<value label>"    (question stays hidden until one of these
 *                                                                    is picked in another question)
 *   SelectorHideIf:<value label> = "<value label>|<value label>"    (that card is hidden while one of these is
 *                                                                    picked in another question; for combinations
 *                                                                    with no variant, e.g. transmission kits)
 *   SelectorAuto:<option name>   = "<value label>"                  (picked behind the scenes while that question
 *                                                                    is hidden after a pick, so the variant
 *                                                                    resolves; e.g. 580 Super M Series III)
 */
const PHONE = '(800) 909-7060';
export default function optionSelector() {
    // only Selector* fields switch this on; every product has other custom fields (FitsModel, etc.)
    const $data = $('#bt-selector-data [data-n^="Selector"]');
    const $fields = $('#productoptions .form-field[data-product-attribute="set-rectangle"]');
    if (!$data.length || !$fields.length) return;

    const fields = {};
    // all fields, not just Selector*: the summary box also reads CorePrice:<SKU>
    $('#bt-selector-data [data-n]').each((i, el) => { fields[el.getAttribute('data-n')] = el.getAttribute('data-v'); });

    $fields.each((i, field) => {
        const $field = $(field).addClass('bt-sel');
        const $label = $field.children('.form-label').first();
        const name = $.trim($label.clone().children().remove().end().text()).replace(/:$/, '');
        $field.attr('data-bt-name', name);
        $label.addClass('bt-sel-q').empty().append(
            $('<span class="bt-sel-num">').text(i + 1),
            $('<span class="bt-sel-qtext">').text(fields[`SelectorQ:${name}`] || name),
        );

        $field.find('label.form-option').each((j, opt) => {
            const $variant = $(opt).find('.form-option-variant');
            const label = $.trim($variant.text());
            $(opt).attr('data-bt-label', label);
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
            <div class="bt-sel-kit-core"></div>
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
    const checkedLabel = $field => $field.find('.form-radio:checked + label.form-option').attr('data-bt-label');
    const pick = ($field, label, on) => {
        const $radio = $field.find(`label.form-option[data-bt-label="${label}"]`).prev('.form-radio');
        if ($radio.prop('checked') !== on) $radio.prop('checked', on).trigger('change');
    };
    // SelectorShowIf / SelectorAuto: show a question only for certain answers to the others
    let applying = false;
    const applyRules = ($changed) => {
        applying = true;
        $fields.each((i, field) => {
            const $field = $(field);
            const name = $field.attr('data-bt-name');
            const showIf = fields[`SelectorShowIf:${name}`];
            if (!showIf) return;
            const want = showIf.split('|').map($.trim);
            const others = $fields.not(field).map((k, f) => checkedLabel($(f))).get();
            const show = others.some(l => want.indexOf(l) !== -1);
            $field.toggleClass('bt-sel-hidden', !show);
            const auto = fields[`SelectorAuto:${name}`];
            if (!show && others.length && auto) {
                pick($field, auto, true);
                $field.attr('data-bt-auto', '1');
            } else if (show && $field.attr('data-bt-auto')) {
                // the customer answers it themselves once it's visible again
                pick($field, checkedLabel($field), false);
                $field.removeAttr('data-bt-auto');
            }
        });
        // SelectorHideIf: a card disappears while a value it doesn't go with is picked in another question.
        // The question just answered wins: a clashing pick in another question is cleared first.
        const clashes = ($opt) => {
            const hideIf = fields[`SelectorHideIf:${$opt.attr('data-bt-label')}`];
            if (!hideIf) return false;
            const others = $fields.not($opt.closest('.form-field')).map((k, f) => checkedLabel($(f))).get();
            return hideIf.split('|').map($.trim).some(l => others.indexOf(l) !== -1);
        };
        const $cards = $fields.find('label.form-option');
        $cards.each((i, opt) => {
            const $opt = $(opt);
            const $field = $opt.closest('.form-field');
            if ($changed && $field.is($changed)) return;
            if ($opt.prev('.form-radio').prop('checked') && clashes($opt)) pick($field, $opt.attr('data-bt-label'), false);
        });
        $cards.each((i, opt) => { $(opt).toggleClass('bt-sel-card-hidden', clashes($(opt))); });
        applying = false;
    };

    const update = () => {
        const $shown = $fields.not('.bt-sel-hidden');
        const picked = $shown.map((i, field) => $(field).find('.form-radio:checked + label.form-option').attr('data-bt-title')).get();
        const done = picked.length === $shown.length;
        $box.toggleClass('is-ready', done);
        $box.find('.bt-sel-kit-name').text(done ? [model].concat(picked).filter(Boolean).join(' · ') : `Answer the ${$shown.length > 1 ? 'questions' : 'question'} above to see ${noun}.`);
        $box.find('.bt-sel-kit-sku').text(done ? `Part # ${$.trim($('#partnum-text').text())}` : '');
        // a kit with purchasing turned off (e.g. Powershift until it's priced) carries a $999 placeholder
        const callOnly = done && $('#form-action-addToCart').prop('disabled');
        $box.find('.bt-sel-kit-price').text(callOnly ? 'Call for price' : (done ? $.trim($('.productView-price [data-product-price-without-tax]').first().text()) : ''));
        // CorePrice:<SKU> = refundable core included in that option's price (see product.js)
        const core = done && !callOnly && parseFloat(fields[`CorePrice:${$.trim($('#partnum-text').text())}`]);
        $box.find('.bt-sel-kit-core').text(core > 0 ? `Includes a $${core.toFixed(2)} refundable core charge` : '');
        $('.productView-price').toggleClass('bt-sel-hide', !!callOnly);
    };
    // SKU and price arrive by ajax after a pick, so follow those elements too
    $fields.on('change', '.form-radio', (e) => {
        if (!applying) applyRules($(e.currentTarget).closest('.form-field'));
        update();
    });
    const observer = new MutationObserver(update);
    $('#partnum-text, .productView-price [data-product-price-without-tax]').each((i, el) => {
        observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
    $('#form-action-addToCart').each((i, el) => observer.observe(el, { attributes: true, attributeFilter: ['disabled'] }));
    applyRules();
    update();
}
