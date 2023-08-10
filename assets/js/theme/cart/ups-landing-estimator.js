import $ from 'jquery';
import stateCountry from '../common/state-country';
import nod from '../common/nod';
import utils from '@bigcommerce/stencil-utils';
import { Validators } from '../common/form-utils';
import swal from 'sweetalert2';

export default class UpsLandingEstimator {
    constructor($element) {
        this.$element = $element;

        this.$state = $('[data-field-type="State"]', this.$element);
        this.initFormValidation();
        this.bindStateCountryChange();
        this.bindEstimatorEvents();
    }

    initFormValidation() {
        this.upsLandingEstimator = 'form[data-shipping-estimator-landing]';
        this.shippingValidator = nod({
            submit: `${this.upsLandingEstimator} .shipping-estimate-landing-submit`,
        });

        $('.shipping-estimate-landing-submit', this.$element).click((event) => {
            // When switching between countries, the state/region is dynamic
            // Only perform a check for all fields when country has a value
            // Otherwise areAll('valid') will check country for validity
            if ($(`${this.upsLandingEstimator} select[name="shipping-country"]`).val()) {
                this.shippingValidator.performCheck();
            }

            if (this.shippingValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
        });

        this.bindValidation();
        this.bindStateValidation();
        this.bindUPSRates();
    }

    bindValidation() {
        this.shippingValidator.add([
            {
                selector: `${this.upsLandingEstimator} select[name="shipping-country"]`,
                validate: (cb, val) => {
                    const countryId = Number(val);
                    const result = countryId !== 0 && !Number.isNaN(countryId);

                    cb(result);
                },
                errorMessage: 'The \'Country\' field cannot be blank.',
            },
        ]);
    }

    bindStateValidation() {
        this.shippingValidator.add([
            {
                selector: $(`${this.upsLandingEstimator} select[name="shipping-state"]`),
                validate: (cb) => {
                    let result;

                    const $ele = $(`${this.upsLandingEstimator} select[name="shipping-state"]`);

                    if ($ele.length) {
                        const eleVal = $ele.val();

                        result = eleVal && eleVal.length && eleVal !== 'State/province';
                    }

                    cb(result);
                },
                errorMessage: 'The \'State/Province\' field cannot be blank.',
            },
        ]);
    }

    /**
     * Toggle between default shipping and ups shipping rates
     */
    bindUPSRates() {
        const UPSRateToggle = '.estimator-form-toggleUPSRate';

        $('body').on('click', UPSRateToggle, (event) => {
            const $estimatorFormUps = $('.estimator-form--ups');
            const $estimatorFormDefault = $('.estimator-form--default');

            event.preventDefault();

            $estimatorFormUps.toggleClass('u-hiddenVisually');
            $estimatorFormDefault.toggleClass('u-hiddenVisually');
        });
    }

    bindStateCountryChange() {
        let $last;

        // Requests the states for a country with AJAX
        stateCountry(this.$state, this.context, { useIdForStates: true }, (err, field) => {
            if (err) {
                swal({
                    text: err,
                    type: 'error',
                });

                throw new Error(err);
            }

            const $field = $(field);

            if (this.shippingValidator.getStatus(this.$state) !== 'undefined') {
                this.shippingValidator.remove(this.$state);
            }

            if ($last) {
                this.shippingValidator.remove($last);
            }

            if ($field.is('select')) {
                $last = field;
                this.bindStateValidation();
            } else {
                $field.attr('placeholder', 'State/province');
                Validators.cleanUpStateValidation(field);
            }

            // When you change a country, you swap the state/province between an input and a select dropdown
            // Not all countries require the province to be filled
            // We have to remove this class when we swap since nod validation doesn't cleanup for us
            $(this.upsLandingEstimator).find('.form-field--success').removeClass('form-field--success');
        });
    }

    bindEstimatorEvents() {
        const $estimatorContainer = $('.shipping-estimator-landing');
        const $estimatorForm = $('.estimator-form-landing');

        $estimatorForm.on('submit', (event) => {
            /* const params = {
                country_id: $('[name="shipping-country"]', $estimatorForm).val(),
                state_id: $('[name="shipping-state"]', $estimatorForm).val(),
                city: $('[name="shipping-city"]', $estimatorForm).val(),
                zip_code: $('[name="shipping-zip"]', $estimatorForm).val(),
            };
 */
            event.preventDefault();

            this.upsLandedApi();

            /* utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
                $('.shipping-quotes').html(response.content);

                // bind the select button
                $('.select-shipping-quote').on('click', (clickEvent) => {
                    const quoteId = $('.shipping-quote:checked').val();

                    clickEvent.preventDefault();

                    utils.api.cart.submitShippingQuote(quoteId, () => {
                        window.location.reload();
                    });
                });
            }); */
        });

        $('.shipping-estimate-show').on('click', (event) => {
            event.preventDefault();
            console.log("Ran here baby")

            $(event.currentTarget).hide();
            $estimatorContainer.removeClass('u-hiddenVisually');
            $('.shipping-estimate-hide').show();
        });


        $('.shipping-estimate-hide').on('click', (event) => {
            event.preventDefault();

            $estimatorContainer.addClass('u-hiddenVisually');
            $('.shipping-estimate-show').show();
            $('.shipping-estimate-hide').hide();
        });
    }

    async upsLandedApi() {
        //remove this in prod, this is to test api on localhost, if it doesn't work, rememeber to turn on proxy
        const proxyURL = 'http://localhost:8010/proxy'
        const version = 'v1';
        const resp = await fetch(`https://wwwcie.ups.com/api/tradeability/${version}/landedcost/quotes`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            mode: "no-cors",
            transId: 'string',
            transactionSrc: 'testing',
            AccountNumber: 'string',
            Authorization: 'Bearer eyJraWQiOiI2NGM0YjYyMC0yZmFhLTQzNTYtYjA0MS1mM2EwZjM2Y2MxZmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzM4NCJ9'
            },
            body: JSON.stringify({
            currencyCode: 'GBP',
            transID: '325467165',
            allowPartialLandedCostResult: false,
            shipment: {
                id: 'ShipmentID83',
                importCountryCode: 'GB',
                importProvince: '',
                shipDate: '',
                exportCountryCode: 'US',
                incoterms: '',
                shipmentItems: [
                {
                    commodityId: '1',
                    grossWeight: '',
                    grossWeightUnit: '',
                    priceEach: '125',
                    hsCode: '400932',
                    quantity: 24,
                    UOM: 'Each',
                    originCountryCode: 'GB',
                    commodityCurrencyCode: 'GBP',
                    description: ''
                },
                {
                    commodityId: '4',
                    grossWeight: '',
                    grossWeightUnit: '',
                    priceEach: '0.5',
                    hsCode: '',
                    quantity: 900,
                    UOM: 'Each',
                    originCountryCode: 'GB',
                    commodityCurrencyCode: 'GBP',
                    description: 'Cord5mm{PK50Yellow/Red'
                }
                ],
                transModes: '',
                transportCost: '',
                shipmentType: 'Sale'
            }
            })
        }
        );

        const data = await resp.json();
        console.log(data);
    }
}
