$(document).ready(function(){
    function initializeOwlCarousel() {
        if ($(window).width() < 1023) {
            if (!$('.owl-carousel').hasClass('owl-loaded')) {
                $('.owl-carousel').owlCarousel({
                    loop: true,
                    margin: 10,
                    nav: true,

                    mouseDrag: true, // Enable mouse drag
                    touchDrag: true, // Enable touch drag
                    pullDrag: true, // Enable pull drag
                    smartSpeed: 600, // Smooth transition speed (in milliseconds)
                    dragEndSpeed: 600, // Smooth drag end speed (in milliseconds)

                    responsive: {
                        0: { items: 1 },
                        600: { items: 3 }
                    }
                });
            }
        } else {
            if ($('.owl-carousel').hasClass('owl-loaded')) {
                $('.owl-carousel').trigger('destroy.owl.carousel').removeClass('owl-loaded');
                $('.owl-carousel').find('.owl-stage-outer').children().unwrap();
            }
        }
    }

    initializeOwlCarousel();

    $(window).resize(function() {
        initializeOwlCarousel();
    });
});


