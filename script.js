(function() {
    
    if (!document.querySelector('.hit__wrapper')) {
        console.log('Слайдер не найден на странице');
        return;
    }

    // константы
    const dots = document.querySelectorAll('.dot');
    const wrapper = document.querySelector('.hit__wrapper');
    const items = document.querySelectorAll('.hit__item');
    const prevButton = document.querySelector('.hit__button-prev');
    const nextButton = document.querySelector('.hit__button-next');
    const buttonUp = document.querySelector('.feedback__button-up');
    const header = document.querySelector('.header');

    // таймеры
    let isScrolling;
    let resizeTimer;

    // проверка инпута с именем
    function initNameValidation() {
        const nameInput = document.querySelector('.input-name');
        if (!nameInput) return;

        function validateName() {
            const hasNumbers = /[0-9]/.test(nameInput.value);
            nameInput.classList.toggle('error', hasNumbers); // добавляем/удаляем класс error
        }

        nameInput.addEventListener('input', validateName);
        validateName(); 
    }

    // Запуск при загрузке страницы
    document.addEventListener('DOMContentLoaded', initNameValidation);


    function getVisibleItemsCount() {
        if (!items.length) return 0;
        return Math.floor(wrapper.offsetWidth / items[0].offsetWidth) || 1;
    }
    // измненение состояния точен
    function updateActiveDot() {
        if (!wrapper || !items.length || !dots.length) return;
        
        const scrollLeft = wrapper.scrollLeft;
        const itemWidth = items[0].offsetWidth;
        const itemsPerScreen = getVisibleItemsCount();
        const currentSlide = Math.round(scrollLeft / itemWidth);
        const activeDotIndex = Math.floor(currentSlide / itemsPerScreen);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    } 

    function handleDotClick(e) {
        if (!wrapper || !items.length) return;
        
        const dotIndex = Array.from(dots).indexOf(e.currentTarget);
        if (dotIndex === -1) return;
        
        wrapper.scrollTo({
            left: dotIndex * getVisibleItemsCount() * items[0].offsetWidth,
            behavior: 'smooth'
        });
    }

    function handleButtonClick(step) {
        if (!wrapper || !items.length) return;
        
        const scrollAmount = getVisibleItemsCount() * items[0].offsetWidth;
        const newScroll = wrapper.scrollLeft + (step * scrollAmount);
        
        wrapper.scrollTo({
            left: Math.max(0, Math.min(newScroll, wrapper.scrollWidth - wrapper.offsetWidth)),
            behavior: 'smooth'
        });
    }

    function handleScroll() {
        clearTimeout(isScrolling);
        isScrolling = setTimeout(updateActiveDot, 100);
    }

    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateActiveDot, 200);
    }

    function handleButtonUpClick() {
        if (header) {
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function setupEventListeners() {
        if (wrapper) wrapper.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        
        if (prevButton) prevButton.addEventListener('click', () => handleButtonClick(-1));
        if (nextButton) nextButton.addEventListener('click', () => handleButtonClick(1));
        
        dots.forEach(dot => {
            if (dot) dot.addEventListener('click', handleDotClick);
        });
        
        if (buttonUp) buttonUp.addEventListener('click', handleButtonUpClick);
    }

    // очистка
    function cleanupEventListeners() {
        if (wrapper) wrapper.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        if (prevButton) prevButton.removeEventListener('click', handleButtonClick); 
        if (nextButton) nextButton.removeEventListener('click', handleButtonClick); 
        
        dots.forEach(dot => {
            if (dot) dot.removeEventListener('click', handleDotClick);
        });
        
        if (buttonUp) buttonUp.removeEventListener('click', handleButtonUpClick);
    }

    function init() {
        if (wrapper) {
            setupEventListeners();
            updateActiveDot();
        }
        
        initNameValidation();
        
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    window.sliderCleanup = cleanupEventListeners;
})();