import $ from 'jquery';
import collapsibleFactory from '../common/collapsible';
import collapsibleGroupFactory from '../common/collapsible-group';

const PLUGIN_KEY = 'menu';

/*
 * Manage the behaviour of a menu
 * @param {jQuery} $menu
 */
class Menu {
    constructor($menu) {
        this.$menu = $menu;
        this.$body = $('body');
        this.hasMaxMenuDisplayDepth = this.$body.find('.navPages-list').hasClass('navPages-list-depth-max');

        // Init collapsibles (kept for compatibility, but not used for submenu toggles)
        this.collapsibles = collapsibleFactory('[data-collapsible]', { $context: this.$menu });
        this.collapsibleGroups = collapsibleGroupFactory($menu);

        // Auto-bind
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);

        // Listen
        this.bindEvents();
    }

    collapseAll() {
        this.collapsibles.forEach(collapsible => collapsible.close());
        this.collapsibleGroups.forEach(group => group.close());
    }

    collapseNeighbors($neighbors) {
        const $collapsibles = collapsibleFactory('[data-collapsible]', { $context: $neighbors });

        $collapsibles.forEach($collapsible => $collapsible.close());
    }

    bindEvents() {
        this.$menu.on('click', this.onMenuClick);
        this.$body.on('click', this.onDocumentClick);
    }

    unbindEvents() {
        this.$menu.off('click', this.onMenuClick);
        this.$body.off('click', this.onDocumentClick);
    }

    onMenuClick(event) {
        if ($(window).width() < 768) {
            event.stopPropagation();

            if (this.hasMaxMenuDisplayDepth) {
                const $neighbors = $(event.target).parent().siblings();
                this.collapseNeighbors($neighbors);
            }
        }
    }

    onDocumentClick() {
        this.collapseAll();
    }
}

/*
 * Create a new Menu instance
 * @param {string} [selector]
 * @return {Menu}
 */
export default function menuFactory(selector = `[data-${PLUGIN_KEY}]`) {
    const $menu = $(selector).eq(0);
    const instanceKey = `${PLUGIN_KEY}-instance`;
    const cachedMenu = $menu.data(instanceKey);

    if (cachedMenu instanceof Menu) {
        return cachedMenu;
    }

    const menu = new Menu($menu);
    $menu.data(instanceKey, menu);

    // Toggle full menu open/close
    $('#shop-parts').on('click', function () {
        const $container = $('.navPages-container');
        const isOpen = $container.is(':visible');
        $(this).toggleClass('active');
        $container.toggle();
        $container.attr('aria-hidden', isOpen ? 'true' : 'false');
        if (document.activeElement) document.activeElement.blur();
    });

    // Custom submenu toggle (desktop only)
    $(document).on('click', '.navPages-action.has-subMenu', function (e) {
    const $link = $(this);
    const targetId = $link.data('collapsible');
    const $submenu = $('#' + targetId);
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        
    }

    e.preventDefault();

    const wasOpen = $link.attr('data-open') === 'true';

    // Close all
    $('.navPage-subMenu').removeClass('is-open').attr('aria-hidden', 'true').hide();
    $('.navPages-action.has-subMenu')
        .removeClass('is-open')
        .attr('aria-expanded', 'false')
        .attr('data-open', 'false');

    if (!wasOpen) {
        // Open the clicked one
        $submenu.addClass('is-open').attr('aria-hidden', 'false').show();
        $link
            .addClass('is-open')
            .attr('aria-expanded', 'true')
            .attr('data-open', 'true');
    }
});






    return menu;
}
