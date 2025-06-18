(function() {
    // константы
    const dots = document.querySelectorAll('.dot');
    const wrapper = document.querySelector('.hit__wrapper');
    const items = document.querySelectorAll('.hit__item');
    const prevButton = document.querySelector('.hit__button-prev');
    const nextButton = document.querySelector('.hit__button-next');
    const buttonUp = document.querySelector('.feedback__button-up');
    const header = document.querySelector('.header');
    const rangeMin = document.querySelector('.range-min');
    const rangeMax = document.querySelector('.range-max');
    const inputMin = document.querySelector('.catalogue__input-min');
    const inputMax = document.querySelector('.catalogue__input-max');
    const progress = document.querySelector('.progress');

    // таймеры
    let isScrolling;
    let resizeTimer;

    // функции для ценового фильтра
    function initPriceFilter() {
    if (!rangeMin || !rangeMax || !inputMin || !inputMax || !progress) return;

    const minVal = parseInt(rangeMin.min, 10);
    const maxVal = parseInt(rangeMax.max, 10);
    
    function updateMinInput() {
        let minValue = parseInt(rangeMin.value, 10);
        let maxValue = parseInt(rangeMax.value, 10);
        
        if (minValue > maxValue) {
            minValue = maxValue;
            rangeMin.value = minValue;
        }
        
        inputMin.value = minValue;
        const percent = ((minValue - minVal) / (maxVal - minVal)) * 100;
        progress.style.left = percent + "%";
    }
    
    function updateMaxInput() {
        let minValue = parseInt(rangeMin.value, 10);
        let maxValue = parseInt(rangeMax.value, 10);
        
        if (maxValue < minValue) {
            maxValue = minValue;
            rangeMax.value = maxValue;
        }
        
        inputMax.value = maxValue;
        const percent = 100 - ((maxValue - minVal) / (maxVal - minVal)) * 100;
        progress.style.right = percent + "%";
    }
    
    // обработчики для ползунков
    rangeMin.addEventListener('input', updateMinInput);
    rangeMax.addEventListener('input', updateMaxInput);
    
    // обработчики для текстовых полей
    inputMin.addEventListener('change', function() {
        rangeMin.value = this.value;
        updateMinInput();
        updateMaxInput(); // обновляем max на случай если min стал больше
    });
    
    inputMax.addEventListener('change', function() {
        rangeMax.value = this.value;
        updateMaxInput();
        updateMinInput(); // обновляем min на случай если max стал меньше
    });
    
    // инициализация
    updateMinInput();
    updateMaxInput();
}

    // проверка инпута с именем
    function initNameValidation() {
        const nameInput = document.querySelector('.input-name');
        if (!nameInput) return;

        function validateName() {
            const hasNumbers = /[0-9]/.test(nameInput.value);
            nameInput.classList.toggle('error', hasNumbers);
        }

        nameInput.addEventListener('input', validateName);
        validateName(); 
    }

    // функции для слайдера
    function getVisibleItemsCount() {
        if (!items.length) return 0;
        return Math.floor(wrapper.offsetWidth / items[0].offsetWidth) || 1;
    }

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
        resizeTimer = setTimeout(() => {
            updateActiveDot();
        }, 200);
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
        
        // очистка ценового фильтра
        if (rangeMin) rangeMin.removeEventListener('input', updateMinInput);
        if (rangeMax) rangeMax.removeEventListener('input', updateMaxInput);
    }

    function init() {
        if (wrapper) {
            setupEventListeners();
            updateActiveDot();
        }
        
        initNameValidation();
        initPriceFilter();
    }

    // запуск инициализации
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    window.sliderCleanup = cleanupEventListeners;
})();