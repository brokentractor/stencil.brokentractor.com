/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import optionSelector from './product/option-selector';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();
        optionSelector();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        // Product price handling logic
        var fit = $('.productView-info-value.FitsModel').text();
        var dim = $('.productView-info-value.ProductDim').text();
        // Core is part of the BigCommerce price; these lines only explain it. A listing with options can
        // carry a core on some options only: CorePrice:<variant SKU> fields, followed as the SKU changes.
        var variantCores = {};
        $('#bt-selector-data [data-n^="CorePrice:"]').each(function () {
            variantCores[this.getAttribute('data-n').slice(10)] = this.getAttribute('data-v');
        });
        var hasVariantCores = !$.isEmptyObject(variantCores);
        var showCore = function () {
            var coreprice = hasVariantCores
                ? (variantCores[$.trim($('#partnum-text').text())] || '0')
                : $('.productView-info-value.CorePrice').text();
            var startprice = $('.price.price--withoutTax').first().text();
            $('.productView-price').find('.corecharge, .totalLine, .totalprice').remove();

            if (startprice === '$0.00') {
                $('.price.price--withoutTax').html('Call for Pricing');
                $('#pv-descriptionbox form').remove();
            } else {
                startprice = startprice.replace('$', '').replace(',', '');
                startprice = parseFloat(startprice).toFixed(2);
                coreprice = coreprice.replace('$', '').replace(',', '');

                if (coreprice > 0 && startprice !== 'NaN') {
                    coreprice = parseFloat(coreprice).toFixed(2);

                    var totalAfterCore = parseFloat(startprice - coreprice).toFixed(2);
                    totalAfterCore = totalAfterCore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    coreprice = coreprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    $('.productView-price').append('<div class="corecharge">Refundable Core Deposit: -$' + coreprice + '</div>');
                    $('.productView-price').append('<hr class="totalLine"><div class="totalprice">Total After Core Return: $' + totalAfterCore + '</div>');
                }
            }
        };
        showCore();
        if (hasVariantCores) {
            // SKU and price arrive by ajax after an option pick
            var coreObserver = new MutationObserver(showCore);
            $('#partnum-text, .productView-price [data-product-price-without-tax]').each(function () {
                coreObserver.observe(this, { childList: true, characterData: true, subtree: true });
            });
        }

        $('#fittext').text(fit);
        $('#partdim-text').text(dim);

        next();
    }

    after(next) {
        this.productReviewHandler();
        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }
}
