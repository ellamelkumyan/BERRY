(function() {
    // ====== Константы ======
    const catalogueWrapper = document.querySelector('.catalogue__wrapper');
    const heatWrapper = document.querySelector('.heat__wrapper');
    const dotPagination = document.querySelector('.dot-pagination');
    const btnPrev = document.querySelector('.heat__button-prev');
    const btnNext = document.querySelector('.heat__button-next');
    const btnButtonUp = document.querySelector('.feedback__button-up');
    const elHeader = document.querySelector('.header');
    const staticImages = [
        'assets/sunrise.png',
        'assets/summer.png',
        'assets/tasty.png',
        'assets/sunrise.png',
        'assets/summer.png',
        'assets/tasty.png'
    ];

    // Объявляем переменные для хранения функций слайдера
    let sliderHandlers = {};

    // ====== 1. Каталог товаров ======
    function initCatalog() {
        if (!catalogueWrapper) return;

        fetch('http://94.198.216.182:5050/api/catalog')
            .then((response) => {
                if (!response.ok) throw new Error(`Сетевая ошибка: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                catalogueWrapper.innerHTML = '';
                
                data.forEach((item) => {
                    const itemElement = document.createElement('div');
                    itemElement.className = `catalogue__item catalogue__item_${item.type}`;
                    itemElement.innerHTML = `
                        <div class="catalogue__item-content">
                            <div class="catalogue__item-title">${item.title}</div>
                            <div class="catalogue__item-button-wrapper">
                                <button class="catalogue__item-button link transparent-button" role="button">
                                    Посмотреть
                                </button>
                            </div>
                        </div>
                    `;
                    catalogueWrapper.appendChild(itemElement);
                });
                
                const finalItem = document.createElement('div');
                finalItem.className = 'catalogue__item catalogue__item_final';
                finalItem.innerHTML = `
                    <div class="catalogue__item-content-final">
                        <div class="catalogue__item-button-wrapper-final">
                            <button class="catalogue__item-button-final link white-button" role="button">
                                <span>Посмотреть<br>все разделы</span>
                                <img class="catalogue__arrow" src="assets/arrow.svg" alt="">
                            </button>
                        </div>
                    </div>
                `;
                catalogueWrapper.appendChild(finalItem);
            })
            .catch((error) => console.error('Не удалось загрузить каталог:', error));
    }

    // ====== 2. Хиты продаж и слайдер ======
    function initHeatsSlider() {
        if (!heatWrapper) {
            console.error('Элемент .heat__wrapper не найден');
            return;
        }

        fetch('http://94.198.216.182:5050/api/catalog/hit')
            .then((response) => {
                if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                heatWrapper.innerHTML = '';
                
                data.data.forEach((item, index) => {
                    const heatItem = document.createElement('div');
                    heatItem.className = 'heat__item';
                    const formattedPrice = item.priceTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                    const itemImage = staticImages[index % staticImages.length];
                    
                    heatItem.innerHTML = `
                        <div class="heat__item-img-wrapper">
                            <img class="heat__item-img" src="${itemImage}" alt="${item.title}">
                        </div>
                        <div class="heat__item-title">${item.title}</div>
                        <div class="heat__item-subtitle">${item.berryList.join(', ')}${item.isSweets ? ' + сладости' : ''}</div>
                        <div class="heat__item-price">${formattedPrice} ₽</div>
                        <div class="heat__item-button-wrapper">
                            <a class="heat__item-button link red-button" role="button" href="#">Добавить в корзину</a>
                        </div>
                    `;
                    heatWrapper.appendChild(heatItem);
                });

                initSlider();
            })
            .catch((error) => console.error('Не удалось загрузить хиты продаж:', error));

        function getVisibleItemsCount() {
            const items = document.querySelectorAll('.heat__item');
            if (!items.length) return 0;
            const itemWidth = items[0].offsetWidth;
            return itemWidth ? Math.floor(heatWrapper.offsetWidth / itemWidth) : 1;
        }

        function updateActiveDot() {
            const items = document.querySelectorAll('.heat__item');
            const dots = document.querySelectorAll('.dot');
            
            if (!items.length || !dots.length) return;
            
            const scrollLeft = heatWrapper.scrollLeft;
            const itemWidth = items[0].offsetWidth;
            const visibleItems = getVisibleItemsCount();
            const currentSlide = Math.round(scrollLeft / itemWidth);
            const activeDotIndex = Math.floor(currentSlide / visibleItems);
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        }

        function handleDotClick(e) {
            const items = document.querySelectorAll('.heat__item');
            const dots = document.querySelectorAll('.dot');
            
            if (!items.length) return;
            
            const dotIndex = Array.from(dots).indexOf(e.currentTarget);
            if (dotIndex === -1) return;
            
            const scrollAmount = getVisibleItemsCount() * items[0].offsetWidth;
            heatWrapper.scrollTo({
                left: dotIndex * scrollAmount,
                behavior: 'smooth'
            });
        }

        function handleButtonClick(step) {
            const items = document.querySelectorAll('.heat__item');
            if (!items.length) return;
            
            const scrollAmount = getVisibleItemsCount() * items[0].offsetWidth;
            const newScroll = heatWrapper.scrollLeft + (step * scrollAmount);
            
            heatWrapper.scrollTo({
                left: Math.max(0, Math.min(newScroll, heatWrapper.scrollWidth - heatWrapper.offsetWidth)),
                behavior: 'smooth'
            });
        }

        function handleScroll() {
            requestAnimationFrame(updateActiveDot);
        }

        function handleResize() {
            updateActiveDot();
        }

        function initSlider() {            
            const items = document.querySelectorAll('.heat__item');
            if (!items.length) return;
            
            const visibleItems = getVisibleItemsCount();
            const dotsCount = Math.ceil(items.length / visibleItems);
            
            dotPagination.innerHTML = '';
            for (let i = 0; i < dotsCount; i++) {
                const dot = document.createElement('span');
                dot.className = `dot ${i === 0 ? 'active' : ''}`;
                dot.addEventListener('click', handleDotClick);
                dotPagination.appendChild(dot);
            }
            
            if (btnPrev) btnPrev.addEventListener('click', () => handleButtonClick(-1));
            if (btnNext) btnNext.addEventListener('click', () => handleButtonClick(1));
            
            heatWrapper.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleResize);
            
            updateActiveDot();
        }

        // Возвращаем объект с функциями для использования в cleanup
        sliderHandlers = {
            handleScroll,
            handleResize,
            handleDotClick,
            handleButtonClick
        };
    }

    // ====== 3. Кнопка "Наверх" ======
    function initScrollToTop() {
        if (!btnButtonUp) {
            console.error('Кнопка "Наверх" не найдена');
            return;
        }

        // Показываем/скрываем кнопку при прокрутке
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                btnButtonUp.style.display = 'block';
            } else {
                btnButtonUp.style.display = 'none';
            }
        });

        // Добавляем обработчик клика
        btnButtonUp.addEventListener('click', handleButtonUpClick);
    }

    function handleButtonUpClick(e) {
        e.preventDefault();
        console.log('Кнопка нажата - прокрутка вверх');
        
        if (elHeader) {
            elHeader.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    function cleanupEventListeners() {
        if (heatWrapper) heatWrapper.removeEventListener('scroll', sliderHandlers.handleScroll);
        window.removeEventListener('resize', sliderHandlers.handleResize);
        
        if (btnPrev) btnPrev.removeEventListener('click', () => sliderHandlers.handleButtonClick(-1)); 
        if (btnNext) btnNext.removeEventListener('click', () => sliderHandlers.handleButtonClick(1)); 
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            if (dot) dot.removeEventListener('click', sliderHandlers.handleDotClick);
        });
        
        if (btnButtonUp) btnButtonUp.removeEventListener('click', handleButtonUpClick);
    }

    // ====== Инициализация всех компонентов ======
    function initAll() {
        initCatalog();
        initHeatsSlider();
        initScrollToTop();
    }

    // Запуск при полной загрузке DOM
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initAll, 0);
    } else {
        document.addEventListener('DOMContentLoaded', initAll);
    }
})();