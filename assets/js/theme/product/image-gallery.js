import $ from 'jquery';
import 'easyzoom';
import _ from 'lodash';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage = $gallery.find('[data-image-gallery-main]');
        this.$selectableImages = $gallery.find('[data-image-gallery-item]');
        this.currentImage = {};
    }

    init() {
        this.bindEvents();       
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.setActiveThumb();
        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.find('img').attr('src'),               
                $selectedThumb: this.currentImage.$selectedThumb,
            };
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        e.preventDefault();

        const $target = $(e.currentTarget);
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),            
            $selectedThumb: $target,
        };

        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        this.$selectableImages.removeClass('is-active');
        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.addClass('is-active');
        }
    }

    swapMainImage() {        
       
    }    

    bindEvents() {
        this.$selectableImages.on('click', this.selectNewImage.bind(this));
    }
}
