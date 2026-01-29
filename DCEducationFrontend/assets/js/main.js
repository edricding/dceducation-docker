(function ($) {
    "use strict";
    var windowOn = $(window);

    /* Windows Load */
    $(window).on('load', function () {
        // Preloader Activation
        $("#pre-load").delay(1500).fadeOut(500);
       

        // Wow Animation Init
        wowAnimation();
    });

    /* footer year */
    var yearElement = document.getElementById("year");
    if (yearElement) { yearElement.innerHTML = new Date().getFullYear(); }
    /* footer year */

    /* Wow Active */
    function wowAnimation() {
        var wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: false,
            live: true
        });
        wow.init();
    }

    /* Sidebar Toggle */
    $(".offcanvas-close,.offcanvas-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("info-open");
        $(".offcanvas-overlay").removeClass("overlay-open");
    });
    $(".sidebar-toggle").on("click", function () {
        $(".offcanvas-area").addClass("info-open");
        $(".offcanvas-overlay").addClass("overlay-open");
    });

    /* Body overlay Js */
    $(".body-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");
    });

    /* Data Css js */
    $("[data-background").each(function () {
        $(this).css(
            "background-image",
            "url( " + $(this).attr("data-background") + "  )"
        );
    });

    $("[data-width]").each(function () {
        $(this).css("width", $(this).attr("data-width"));
    });

    $("[data-bg-color]").each(function () {
        $(this).css("background-color", $(this).attr("data-bg-color"));
    });

    

    /* MagnificPopup image view */
    $(".popup-image").magnificPopup({
        type: "image",
        gallery: {
            enabled: true,
        },
    });

    /* jarallax js */
    jarallax(document.querySelectorAll('.jarallax'), {
        speed: 0.5,
    });

    /* MagnificPopup video view */
    $(".popup-video").magnificPopup({
        type: "iframe",
    });




    //===== Odometer js
    $('.odometer').appear(function (e) {
        var odo = $(".odometer");
        odo.each(function () {
            var countNumber = $(this).attr("data-count");
            $(this).html(countNumber);
        });
    });


     
    $(document).ready(function () {
        // circle text slide
        if ($('.rs-text-circle').length) {
            $(".rs-text-circle").each(function () {
                // Wrap all charecter inside a span
                var sentence = $(this).text().replace(/\s+/g, ' ').trim();
                var wrappedSentence = '';
                for (var i = 0; i < sentence.length; i++) {
                    wrappedSentence += '<span>' + sentence[i] + '</span>';
                }
                $(this).html(wrappedSentence);

                // Give a rotate value for each span
                var rotateDegree = $(this).data("rotate-degree") || 20;
                $(this).find("span").each(function (index) {
                    $(this).css("transform", "rotate(" + ((index + 1) * rotateDegree) + "deg)");
                });
            });
        }

        // Swiper Dynamic Slider Active
        // $('.rs-swiper .swiper').each(function (index) {
        //     var $swiper = $(this);
        //     var hoverAutoplay = $swiper.data('hover-pause') === undefined ? true : $swiper.data('hover-pause');
        //     var loop = $(this).data('loop') === undefined ? true : $(this).data('loop');
        //     var centeredSlides = $(this).data('center-mode') === undefined ? false : $(this).data('center-mode');
        //     var autoplay = $(this).data('autoplay') === undefined ? true : $(this).data('autoplay');
        //     var dynamicBullets = $(this).data('dots-dynamic') === undefined ? true : $(this).data('dots-dynamic');
        //     var direction = $(this).data('direction') === 'vertical' ? 'vertical' : 'horizontal';
        //     var fridgeMovement = $(this).data('play-slide') === undefined ? true : $(this).data('play-slide');
        //     var effect = $(this).data('effect') || 'slide'; //'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'creative' | 'cards';
        //     var grabCursor = $(this).data('grab-cursor') === undefined ? false : $(this).data('grab-cursor');
        //     var oneWayMovement = $(this).data('one-way') === undefined ? false : $(this).data('one-way');
        //     var startAt = $(this).data('start-at');
        //     var slidesPerView = $(this).data('item');
        //     var speed = $(this).data('speed');
        //     var gap = (($(this).data('no-gap') === true) ? 0 : 30);
        //     var margin = ($(this).data('margin') ? $(this).data('margin') : gap);


        //     // Breakpoints
        //     var slidesPerViewXl = $(this).data('item-xl');
        //     var slidesPerViewLg = $(this).data('item-lg');
        //     var slidesPerViewMd = $(this).data('item-md');
        //     var slidesPerViewSm = $(this).data('item-sm');
        //     var slidesPerViewXs = $(this).data('item-xs');
        //     var slidesPerViewMobile = $(this).data('item-mobile');
        //     var marginXl = ($(this).data('margin-xl') ? $(this).data('margin-xl') : margin);
        //     var marginLg = ($(this).data('margin-lg') ? $(this).data('margin-lg') : marginXl);
        //     var marginMd = ($(this).data('margin-md') ? $(this).data('margin-md') : marginLg);
        //     var marginSm = ($(this).data('margin-sm') ? $(this).data('margin-sm') : marginMd);
        //     var marginXs = ($(this).data('margin-xs') ? $(this).data('margin-xs') : marginSm);
        //     var marginMobile = ($(this).data('margin-mobile') ? $(this).data('margin-mobile') : marginXs);

        //     // Controls unique classes based on the index
        //     var rsNavPrev = `rs-nav-prev-${index}`;
        //     var rsNavNext = `rs-nav-next-${index}`;
        //     $swiper.closest('.rs-swiper').find('.swiper-button-prev').addClass(rsNavPrev);
        //     $swiper.closest('.rs-swiper').find('.swiper-button-next').addClass(rsNavNext);

        //     var rsPagination = `rs-pagination-${index}`;
        //     $swiper.closest('.rs-swiper').find('.swiper-pagination').addClass(rsPagination);

        //     var swiper = new Swiper(this, {
        //         loop: loop,
        //         autoplay: autoplay,  // data-autoplay="true" => Delay | .swiper-slide | data-swiper-autoplay="2000">
        //         direction: direction,
        //         effect: effect,
        //         enabled: fridgeMovement,
        //         grabCursor: grabCursor,
        //         oneWayMovement: oneWayMovement,
        //         centeredSlides: centeredSlides,
        //         initialSlide: (startAt ? startAt : 0),
        //         slidesPerView: (slidesPerView ? slidesPerView : 1),
        //         spaceBetween: margin,
        //         speed: (speed ? speed : 500),

        //         pagination: {
        //             el: `.${rsPagination}`,
        //             dynamicBullets: dynamicBullets,
        //             clickable: true,
        //         },

        //         navigation: {
        //             nextEl: `.${rsNavPrev}`,
        //             prevEl: `.${rsNavNext}`,
        //         },

        //         breakpoints: {
        //             10: {
        //                 slidesPerView: (slidesPerViewMobile ? slidesPerViewMobile : 1),
        //                 spaceBetween: marginMobile,
        //             },
        //             481: {
        //                 slidesPerView: (slidesPerViewXs ? slidesPerViewXs : 1),
        //                 spaceBetween: marginXs,
        //             },
        //             576: {
        //                 slidesPerView: (slidesPerViewSm ? slidesPerViewSm : 1),
        //                 spaceBetween: marginSm,
        //             },
        //             768: {
        //                 slidesPerView: (slidesPerViewMd ? slidesPerViewMd : 1),
        //                 spaceBetween: marginMd,
        //             },
        //             992: {
        //                 slidesPerView: (slidesPerViewLg ? slidesPerViewLg : 1),
        //                 spaceBetween: marginLg,
        //             },
        //             1025: {
        //                 slidesPerView: (slidesPerViewXl ? slidesPerViewXl : 1),
        //                 spaceBetween: marginXl,
        //             },
        //             1201: {
        //                 slidesPerView: (slidesPerView ? slidesPerView : 1),
        //                 spaceBetween: margin,
        //             }
        //         }
        //     });
        //     if (hoverAutoplay) {
        //         $swiper.on('mouseenter', function () {
        //             swiper.autoplay.stop();
        //         }).on('mouseleave', function () {
        //             swiper.autoplay.start();
        //         });
        //     }
        // });

        // Team Social Icon trigger Button
        $('.social-trigger-btn').on('click',function() {
            $(this).parents('.team-info-inner').toggleClass('is-open')
        });
           
            
        /* Button scroll up js */
        $(window).on("scroll", function () {
            var scrollTop = $(window).scrollTop();
            var documentHeight = $(document).height();
            var windowHeight = $(window).height();
            $(".progress-circle").css("stroke-dashoffset", 113.1 - 113.1 * (scrollTop / (documentHeight - windowHeight)));
            if (scrollTop > 150) {
                $(".backtotop-wrap").addClass("active-progress").fadeIn();
            } else {
                $(".backtotop-wrap").removeClass("active-progress").fadeOut();
            }
            
        // Sticky Header
        if ($(this).scrollTop() > 250) {
            $("#header-sticky").addClass("rs-sticky");
        } else {
            $("#header-sticky").removeClass("rs-sticky");
        }
        });            
        $(".backtotop-wrap").on("click", function () {
            $("html,body").animate({ scrollTop: 0 }, 500);
        });

        // work process active
        $('.work-process-wrapper .work-process-item').on('mouseenter', function(){
            $('.work-process-wrapper .work-process-item').removeClass('active');
            $(this).addClass('active');
        });


        // Menu Active
        const currentPath = window.location.pathname.split('/').pop();
        const menuLinks = document.querySelectorAll('.multipage-menu a');
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
                let parentLi = link.parentElement;
                while (parentLi) {
                    if (parentLi.tagName === 'LI') {
                        parentLi.classList.add('active');
                    }
                    parentLi = parentLi.parentElement;
                }
            }
        });


        /* Mobile Menu Js */
        $("#mobile-menu").meanmenu({
            meanMenuContainer: ".mobile-menu",
            meanScreenWidth: "1199",
            meanExpand: ['<i class="fa-regular fa-plus"></i>'],
        });

     

        /* countdown activation start */
        function makeTimer(endTime, countdownElementId) {
            var now = new Date();
            now = (Date.parse(now) / 1000);
            var timeLeft = endTime - now;
            if (timeLeft <= 0) {
                clearInterval(timerInterval); // Stop the timer
                $("#" + countdownElementId + " [data-unit='days']").html("00<span>Days</span>");
                $("#" + countdownElementId + " [data-unit='hours']").html("00<span>Hours</span>");
                $("#" + countdownElementId + " [data-unit='minutes']").html("00<span>Minutes</span>");
                $("#" + countdownElementId + " [data-unit='seconds']").html("00<span>Seconds</span>");
                return;
            }
            var days = Math.floor(timeLeft / 86400);
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            if (hours < "10") { hours = "0" + hours; }
            if (minutes < "10") { minutes = "0" + minutes; }
            if (seconds < "10") { seconds = "0" + seconds; }
            $("#" + countdownElementId + " [data-unit='days']").html(days + "<span>Days</span>");
            $("#" + countdownElementId + " [data-unit='hours']").html(hours + "<span>Hours</span>");
            $("#" + countdownElementId + " [data-unit='minutes']").html(minutes + "<span>Minutes</span>");
            $("#" + countdownElementId + " [data-unit='seconds']").html(seconds + "<span>Seconds</span>");
        }
        var endTime = new Date("5 August 2025 14:00:00 GMT+06:00");
        endTime = (Date.parse(endTime) / 1000);
        var timerInterval = setInterval(function () {
            makeTimer(endTime, "countdown1");
            makeTimer(endTime, "countdown2");
            makeTimer(endTime, "countdown3");
            makeTimer(endTime, "countdown4");
            makeTimer(endTime, "countdown5");
        }, 1000);

        // Tab Auto Switcher
        if ($('.work-step-wrapper.auto-switch').length) {
            var interval = 5000;
            var autoSwitchTimer;
            function switchTabs() {
                var $activeTab = $('.work-step-wrapper.auto-switch .nav-item .nav-link.active');
                var $nextTab = $activeTab.closest('.nav-item').next('.nav-item').find('.nav-link');
                if (!$nextTab.length) {
                    $nextTab = $('.work-step-wrapper.auto-switch .nav-item').first().find('.nav-link');
                }
                $nextTab.trigger('click');
            }
            function startAutoSwitch() {
                autoSwitchTimer = setInterval(switchTabs, interval);
            }
            startAutoSwitch();
            $('.rs-services-tab-wrapper.auto-switch').on('mouseenter', function() {
                clearInterval(autoSwitchTimer);
            });
            $('.rs-services-tab-wrapper.auto-switch').on('mouseleave', function() {
                startAutoSwitch();
            });
        }
    });
    
    /* pralax image */
    if ($('.prallax-parent').length) {
        $(".prallax-parent").each(function () {
            var prallaxParent = $(this).get(0);
            var parallaxInstance = new Parallax(prallaxParent);
        });
    }

    //    mouse move
    document.addEventListener('mousemove', function (event) {
        // Get the mouse position
        let x = event.clientX;
        let y = event.clientY;

        // Calculate the percentage of the mouse position relative to the window size
        let xPercent = (x / window.innerWidth) - 0.5;
        let yPercent = (y / window.innerHeight) - 0.5;

        // Select all the shapes
        let shapes = document.querySelectorAll('.shape-move img');

        // Loop through each shape and apply a transform based on mouse position
        shapes.forEach(function (shape, index) {
            // Modify the multiplier values to control the movement intensity
            let multiplierX = 40 + index * 2;
            let multiplierY = 40 + index * 2;

            let translateX = xPercent * multiplierX;
            let translateY = yPercent * multiplierY;

            shape.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    });


    // Smooth Scroling
    if ($('.rs-smoother-yes').length) {
        const lenis = new Lenis({
            smoothWheel: true,
            wheelMultiplier: 1.2,
            duration: 1.5,
            lerp: 0.1,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Handle scroll animation for anchor links
        document.querySelectorAll('a[href^="#"]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault()
                const id = el.getAttribute('href')?.slice(1)
                if (!id) return
                const target = document.getElementById(id)
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' })
                }
            })
        });
    }

    // button style
    $('.rs-button-wrapper .rs-btn').mouseenter(function () {
        $(this).find('.rs-icon').css('animation', 'btnHoverEffect 0.5s');
    });
    $('.rs-button-wrapper .rs-btn').mouseleave(function () {
        $(this).find('.rs-icon').css('animation', 'btnHoverEffectReverse 0.5s');
    });
			
			


})(jQuery);

