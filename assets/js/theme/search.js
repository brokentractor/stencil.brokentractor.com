import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';
import urlUtils from './common/url-utils';
import Url from 'url';
import collapsibleFactory from './common/collapsible';
import 'jstree';
import nod from './common/nod';

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
            
            $(this).find('.price.price--withoutTax').html('$'+ newcprice);
            $(this).find('.price-section--withoutTax').append('<div class="corecharge">Core Charge: $'+ coreprice+'</div>');
        }
        
    });

}

$('#sort-toggle').click( function() {
    $(this).toggleClass('active');
    $('#sortitems').toggle();
    $('.toggleLink.is-open').removeClass('is-open');
    $('.facetedSearch-navList.is-open').removeClass('is-open');    
});

$('#sort').change( function() {
    $('#sort-toggle').toggleClass('active');
    $('#sortitems').toggle();
});

$('.navList-action--checkbox').click( function() {
    $('.toggleLink.is-open').removeClass('is-open');
    $('.facetedSearch-navList.is-open').removeClass('is-open');     
});

$('.sortitem').click( function() {
    var sortvar = $(this).data('select');
    $('#sort option[value="'+sortvar+'"]').attr('selected', true);
    $('#sort').trigger('change');
});

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

export default class Search extends CatalogPage {
    formatCategoryTreeForJSTree(node) {
        const nodeData = {
            text: node.data,
            id: node.metadata.id,
            state: {
                selected: node.selected,
            },
        };

        if (node.state) {
            nodeData.state.opened = node.state === 'open';
            nodeData.children = true;
        }

        if (node.children) {
            nodeData.children = [];
            node.children.forEach((childNode) => {
                nodeData.children.push(this.formatCategoryTreeForJSTree(childNode));
            });
        }

        return nodeData;
    }

    showProducts() {
        const url = urlUtils.replaceParams(window.location.href, {
            section: 'product',
        });

        /*this.$productListingContainer.removeClass('u-hiddenVisually');
        this.$facetedSearchContainer.removeClass('u-hiddenVisually');
        this.$contentResultsContainer.addClass('u-hiddenVisually');*/

        urlUtils.goToUrl(url);
    }

    showContent() {
        const url = urlUtils.replaceParams(window.location.href, {
            section: 'content',
        });

        /*this.$contentResultsContainer.removeClass('u-hiddenVisually');
        this.$productListingContainer.addClass('u-hiddenVisually');
        this.$facetedSearchContainer.addClass('u-hiddenVisually');*/

        urlUtils.goToUrl(url);
    }

    loaded() {
        const $searchForm = $('[data-advanced-search-form]');
        const $categoryTreeContainer = $searchForm.find('[data-search-category-tree]');
        const url = Url.parse(window.location.href, true);
        const treeData = [];
        this.$productListingContainer = $('#product-listing-container');
        this.$facetedSearchContainer = $('#faceted-search-container');
        this.$contentResultsContainer = $('#search-results-content');

        coreprices();

        // Init faceted search
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Init collapsibles
        collapsibleFactory();

        $('[data-product-results-toggle]').click((event) => {
            event.preventDefault();
            this.showProducts();
        });

        $('[data-content-results-toggle]').click((event) => {
            event.preventDefault();
            this.showContent();
        });

        if (this.$productListingContainer.find('li.product').length === 0 || url.query.section === 'content') {
            this.showContent();
        } else {
            this.showProducts();
        }

        const validator = this.initValidation($searchForm)
            .bindValidation($searchForm.find('#search_query_adv'));

        this.context.categoryTree.forEach((node) => {
            treeData.push(this.formatCategoryTreeForJSTree(node));
        });

        this.categoryTreeData = treeData;
        this.createCategoryTree($categoryTreeContainer);

        $searchForm.submit((event) => {
            const selectedCategoryIds = $categoryTreeContainer.jstree().get_selected();

            if (!validator.check()) {
                return event.preventDefault();
            }

            $searchForm.find('input[name="category\[\]"]').remove();

            for (const categoryId of selectedCategoryIds) {
                const input = $('<input>', {
                    type: 'hidden',
                    name: 'category[]',
                    value: categoryId,
                });

                $searchForm.append(input);
            }
        });


        
        if ($('.Additional.Information').text().length > 0) {
            $('.Additional.Information').show();
            $('.ListDetails').show();
            $('.productrow:not(:has(.Additional.Information))').each( function() {
                $('<td class="filler"></td>').insertAfter($(this).find('.ListDescription'));
            });                   
        }       

    }

    loadTreeNodes(node, cb) {
        $.ajax({
            url: '/remote/v1/category-tree',
            data: {
                selectedCategoryId: node.id,
                prefix: 'category',
            },
            success: (data) => {
                const formattedResults = [];

                data.forEach((dataNode) => {
                    formattedResults.push(this.formatCategoryTreeForJSTree(dataNode));
                });

                cb(formattedResults);
            },
        });
    }

    createCategoryTree($container) {
        const treeOptions = {
            core: {
                data: (node, cb) => {
                    // Root node
                    if (node.id === '#') {
                        cb(this.categoryTreeData);
                    } else {
                        // Lazy loaded children
                        this.loadTreeNodes(node, cb);
                    }
                },
                themes: {
                    icons: true,
                },
            },
            checkbox: {
                three_state: false,
            },
            plugins: [
                'checkbox',
            ],
        };

        $container.jstree(treeOptions);
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $searchHeading = $('#search-results-heading');
        const $searchCount = $('#search-results-product-count');
        const productsPerPage = this.context.searchProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'search/product-listing',
                sidebar: 'search/sidebar',
                heading: 'search/heading',
                productCount: 'search/product-count',
            },
            config: {
                product_results: {
                    limit: productsPerPage,
                },
            },
            showMore: 'search/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            $searchHeading.html(content.heading);
            $searchCount.html(content.productCount);

            if ($('.is-selected').length > 0) {
                $('#searchactions > .facetedSearch-refineFilters').remove();
                $('.facetedSearch-refineFilters').clone().appendTo('#searchactions');            
                $('.facetedSearch-refineFilters').show();     
            } else {
                $('#searchactions > .facetedSearch-refineFilters').remove();
            }
            $('.toggleLink.is-open').removeClass('is-open');
            $('.facetedSearch-navList.is-open').removeClass('is-open');   
            

            coreprices();
            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }

    initValidation($form) {
        this.$form = $form;
        this.validator = nod({
            submit: $form,
        });

        return this;
    }

    bindValidation($element) {
        if (this.validator) {
            this.validator.add({
                selector: $element,
                validate: 'presence',
                errorMessage: $element.data('error-message'),
            });
        }

        return this;
    }

    check() {
        if (this.validator) {
            this.validator.performCheck();
            return this.validator.areAll('valid');
        }

        return false;
    }
}
