(function() {
    // константы
    const el_dots = document.querySelectorAll('.dot');
    const el_wrapper = document.querySelector('.hit__wrapper');
    const el_items = document.querySelectorAll('.hit__item');
    const btn_prevButton = document.querySelector('.hit__button-prev');
    const btn_nextButton = document.querySelector('.hit__button-next');
    const btn_buttonUp = document.querySelector('.feedback__button-up');
    const el_header = document.querySelector('.header');

    // таймеры
    let isScrolling;
    let resizeTimer;

	
    // проверка инпута с именем
    function initNameValidation() {
        const nameInput = document.querySelector('.input-name');
        if (!nameInput) return;

        function validateName() {
            const hasNumbers = /[0-9]/.test(nameInput.value);
            nameInput.classList.toggle('invalid', hasNumbers);
        }

        nameInput.addEventListener('input', validateName);
        validateName(); 
    }

    // функции для слайдера
    function getVisibleItemsCount() {
        if (!el_items.length) return 0;
        return Math.floor(el_wrapper.offsetWidth / el_items[0].offsetWidth) || 1;
    }

    function updateActiveDot() {
        if (!el_wrapper || !el_items.length || !el_dots.length) return;
        
        const scrollLeft = el_wrapper.scrollLeft;
        const itemWidth = el_items[0].offsetWidth;
        const el_itemsPerScreen = getVisibleItemsCount();
        const currentSlide = Math.round(scrollLeft / itemWidth);
        const activeDotIndex = Math.floor(currentSlide / el_itemsPerScreen);
        
        el_dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
		const startIndex = activeDotIndex * el_itemsPerScreen;
        for (let i = startIndex; i < startIndex + el_itemsPerScreen; i++) {
            if (el_items[i]) {
                // задержка для анимации
                setTimeout(() => {
                    if (el_items[i]) {
                        el_items[i].style.opacity = '1';
                    }
                }, 50 * (i - startIndex));
            }
        }
    } 

    function handleDotClick(e) {
        if (!el_wrapper || !el_items.length) return;
        
        const dotIndex = Array.from(el_dots).indexOf(e.currentTarget);
        if (dotIndex === -1) return;
        
        el_wrapper.scrollTo({
            left: dotIndex * getVisibleItemsCount() * el_items[0].offsetWidth,
            behavior: 'smooth'
        });
    }

    function handleButtonClick(step) {
        if (!el_wrapper || !el_items.length) return;
        
        const scrollAmount = getVisibleItemsCount() * el_items[0].offsetWidth;
        const newScroll = el_wrapper.scrollLeft + (step * scrollAmount);
        
        el_wrapper.scrollTo({
            left: Math.max(0, Math.min(newScroll, el_wrapper.scrollWidth - el_wrapper.offsetWidth)),
            behavior: 'smooth'
        });
    }

    function handleScroll() {
        clearTimeout(isScrolling);
        isScrolling = setTimeout(updateActiveDot, 100);
    }

    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateActiveDot();
        }, 200);
    }

    function handleButtonUpClick() {
        if (el_header) {
            el_header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function setupEventListeners() {
        if (el_wrapper) el_wrapper.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        
        if (btn_prevButton) btn_prevButton.addEventListener('click', () => handleButtonClick(-1));
        if (btn_nextButton) btn_nextButton.addEventListener('click', () => handleButtonClick(1));
        
        el_dots.forEach(dot => {
            if (dot) dot.addEventListener('click', handleDotClick);
        });
        
        if (btn_buttonUp) btn_buttonUp.addEventListener('click', handleButtonUpClick);
    }

    // очистка
    function cleanupEventListeners() {
        if (el_wrapper) el_wrapper.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        if (btn_prevButton) btn_prevButton.removeEventListener('click', handleButtonClick); 
        if (btn_nextButton) btn_nextButton.removeEventListener('click', handleButtonClick); 
        
        el_dots.forEach(dot => {
            if (dot) dot.removeEventListener('click', handleDotClick);
        });
        
        if (btn_buttonUp) btn_buttonUp.removeEventListener('click', handleButtonUpClick);
    }

    function init() {
        if (el_wrapper) {
            setupEventListeners();
            updateActiveDot();
        }
        
        initNameValidation();
    }

    // запуск инициализации
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    window.sliderCleanup = cleanupEventListeners;
})();