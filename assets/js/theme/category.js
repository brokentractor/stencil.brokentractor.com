import {
    hooks
} from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';

function coreprices() {
    $('.productrow').each( function() {

        var coreprice = 0;
        var startprice = $(this).find('.price.price--withoutTax').text();

        if ($(this).find('.CorePrice').length > 0) {
            coreprice = $(this).find('.CorePrice').text();
        }
        if ($(this).find('.pvcol.FitsModel').length < 1) {
            $('<td class="pvcol FitsModel">&nbsp;</td>').insertAfter($(this).children('.pvcol.image'));
        }
        if ($(this).find('.pvcol.ListDescription').length < 1) {
            $('<td class="pvcol ListDescription">&nbsp;</td>').insertAfter($(this).children('.pvcol.FitsModel'));
        }


        console.log(coreprice);
        if (startprice == '$0.00') {
            $(this).find('.price.price--withoutTax').html('Call for Pricing');
            $(this).find('.listatc').hide();
        } else if (coreprice != '0') {
            startprice = startprice.replace('$', '');
            startprice = startprice.replace(',', '');
            startprice = parseFloat(startprice).toFixed(2);
            coreprice = parseFloat(coreprice).toFixed(2);
            var newcprice = +startprice - +coreprice;
            newcprice = parseFloat(newcprice).toFixed(2);
            newcprice = newcprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            // var totalcprice = +newcprice - +coreprice;
            // totalcprice = parseFloat(totalcprice).toFixed(2);
            // totalcprice = totalcprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            $(this).find('.price.price--withoutTax').html('$'+ newcprice);
            $(this).find('.price-section--withoutTax').append('<div class="corecharge">Refundable Core Charge: $'+ coreprice+'</div>');
            // $(this).find('.price.price--withoutTax').html('$'+ totalcprice);

        }

    });
}

function addItemToCartFromSearch(id, currentCartNum, title){
    console.log(title)

    var data = {
        "quantity" : "1",
        "product_id" : id,
    }
    $.ajax({
        type: 'POST',
        url: '/remote/v1/cart/add',
        data: data,
        dataType: 'json',
        success: function(response){
            var num = Number(currentCartNum) + 1;
            console.log("currentCartNum = " + currentCartNum);
            var pTitle = title;
            $('.countPill.cart-quantity').empty();
            $('.countPill.cart-quantity').text("(" + num + ")");
            $("#modal").foundation('reveal', 'open');
            $(".modal-content").html("<div style='margin:0 auto; display:block; padding:20px; text-align:center;'><h3 style='margin-top:10px'>1 x " + pTitle + " was successfully added to your cart.</h3><br/><img src='" + response.data.cart_item.thumbnail + "' style='margin:0 auto;' /><div class='modal-btn-wrap'><a href='/cart.php' class='modal-btn'>View Cart</a><span class='modal-close modal-btn'>Continue Shopping</span></div></div>");
        }
    });
}

$(document).on('click', 'a.listatc', function(e){
    console.log("from page.js");
    e.preventDefault();
    var currentCartNum = $('.cart-quantity').text().replace(/\D/g,'');
    var title = $(this).data("name");
    console.log(title);
    var id = $(this).data("id");
    addItemToCartFromSearch(id, currentCartNum, title);
});

export default class Category extends CatalogPage {

    before(next) {

        var dsheight = $('#categoryDescription').height();
        if (dsheight > 400) {
            $('#categoryDescription').addClass('hidedesc');
            $('#categoryDescription').after('<div id="cat-showmore">Read More</div>');
            $('#cat-showmore').click(function() {
                $('#categoryDescription').css('max-height', 'none');
                $('#categoryDescription').removeClass('hidedesc');
                $('#cat-showmore').hide();
            });
        }
        next();
    }

    loaded(next) {

        $('#backtotop').click( function() {
             $('html,body').animate({ scrollTop: 0 }, 'slow');
        });

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
        if ($('#categoryDescription h1').length > 0) {
            var dttext = $('#categoryDescription h1').text();
            $('#categoryDescription h1').hide();
            $('h1.page-heading').html(dttext);
        }
        if ($('.subcat').length < 1) {
            $('#dsubcat').hide();
        }
        if ($('#refImg').length > 0) {
            $('#categoryDescription img').appendTo('#refImg');
        }
        coreprices();

        if ($('.Additional.Information').text().length > 0) {
            $('.Additional.Information').show();
            $('.ListDetails').show();
            $('.productrow:not(:has(.Additional.Information))').each( function() {
                $('<td></td>').insertAfter($(this).find('.ListDescription'));
            });
        }



        $(window).scroll(function() {
            var scrollPos = $(window).scrollTop();

            if (scrollPos <= 200) {
                $('#backtotop').fadeOut();
            } else {
                $('#backtotop').fadeIn();
            }

        });



        next();
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            coreprices();
            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }
}
