(function() {
    // константы
    const el_rangeMin = document.querySelector('.range-min');
    const el_rangeMax = document.querySelector('.range-max');
    const inp_inputMin = document.querySelector('.catalogue__input-min');
    const inp_inputMax = document.querySelector('.catalogue__input-max');
    const el_progress = document.querySelector('.progress');
	const btn_lookMoreButton = document.querySelector('.catalogue__look-more');
    const el_hiddenBlock = document.querySelector('.catalogue__filter-berries-hidden');


	// функция для кнопки "Посмотреть все/Скрыть"
    function initLookMoreButton() {
        if (!btn_lookMoreButton || !el_hiddenBlock) return;

        btn_lookMoreButton.addEventListener('click', function() {
            if (el_hiddenBlock.classList.contains('hidden')) {
                el_hiddenBlock.classList.remove('hidden');
                btn_lookMoreButton.textContent = 'Скрыть';
            } else {
                el_hiddenBlock.classList.add('hidden');
                btn_lookMoreButton.textContent = 'Посмотреть все';
            }
        });
    }


    // функции для ценового фильтра
    function initPriceFilter() {
        if (!el_rangeMin || !el_rangeMax || !inp_inputMin || !inp_inputMax || !el_progress) return;

        const minVal = parseInt(el_rangeMin.min, 10);
        const maxVal = parseInt(el_rangeMax.max, 10);
        const minGap = 100; // Минимальное расстояние между ползунками
        
        function updateProgress() {
            const minValue = parseInt(el_rangeMin.value, 10);
            const maxValue = parseInt(el_rangeMax.value, 10);
            
            const leftPercent = ((minValue - minVal) / (maxVal - minVal)) * 100;
            const rightPercent = 100 - ((maxValue - minVal) / (maxVal - minVal)) * 100;
            
            el_progress.style.left = leftPercent + "%";
            el_progress.style.right = rightPercent + "%";
        }

        function updateMinInput() {
            let minValue = parseInt(el_rangeMin.value, 10);
            let maxValue = parseInt(el_rangeMax.value, 10);
            
            // Защита от сближения ползунков
            if (minValue > maxValue - minGap) {
                minValue = maxValue - minGap;
                el_rangeMin.value = minValue;
            }
            
            inp_inputMin.value = minValue;
            updateProgress();
        }
        
        function updateMaxInput() {
            let minValue = parseInt(el_rangeMin.value, 10);
            let maxValue = parseInt(el_rangeMax.value, 10);
            
            // Защита от сближения ползунков
            if (maxValue < minValue + minGap) {
                maxValue = minValue + minGap;
                el_rangeMax.value = maxValue;
            }
            
            inp_inputMax.value = maxValue;
            updateProgress();
        }
        
        // обработчики для ползунков
        el_rangeMin.addEventListener('input', updateMinInput);
        el_rangeMax.addEventListener('input', updateMaxInput);
        
        // обработчики для текстовых полей
        inp_inputMin.addEventListener('change', function() {
            let value = parseInt(this.value) || minVal;
            let maxValue = parseInt(inp_inputMax.value, 10);
            
            // Корректировка с учетом минимального зазора
            if (value > maxValue - minGap) value = maxValue - minGap;
            if (value < minVal) value = minVal;
            
            el_rangeMin.value = value;
            updateMinInput();
        });
        
        inp_inputMax.addEventListener('change', function() {
            let value = parseInt(this.value) || maxVal;
            let minValue = parseInt(inp_inputMin.value, 10);
            
            // Корректировка с учетом минимального зазора
            if (value < minValue + minGap) value = minValue + minGap;
            if (value > maxVal) value = maxVal;
            
            el_rangeMax.value = value;
            updateMaxInput();
        });
        
        // инициализация
        updateMinInput();
        updateMaxInput();
        updateProgress();
    }

    // очистка
    function cleanupEventListeners() {
        // очистка ценового фильтра
        if (el_rangeMin) el_rangeMin.removeEventListener('input', updateMinInput);
        if (el_rangeMax) el_rangeMax.removeEventListener('input', updateMaxInput);
    }

    function init() {
        initPriceFilter();
		initLookMoreButton();
    }

    // запуск инициализации
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    window.sliderCleanup = cleanupEventListeners;
})();