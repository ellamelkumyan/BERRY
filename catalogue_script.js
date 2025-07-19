(function() {
    // ====== Константы ======
    const heartItem = document.querySelector('.catalogue__kinds-item.item-heart');
    const boxItem = document.querySelector('.catalogue__kinds-item.item-box');
    const plasticItem = document.querySelector('.catalogue__kinds-item.item-plastic');
    const basketItem = document.querySelector('.catalogue__kinds-item.item-basket');
    const bouquetItem = document.querySelector('.catalogue__kinds-item.item-bouquet');
    const resultsContainer = document.querySelector('.catalogue__result-wrapper');
    const lookMoreButton = document.querySelector('.catalogue__result-look-more');
    const el_rangeMin = document.querySelector('.range-min');
    const el_rangeMax = document.querySelector('.range-max');
    const inp_inputMin = document.querySelector('.catalogue__input-min');
    const inp_inputMax = document.querySelector('.catalogue__input-max');
    const el_progress = document.querySelector('.progress');
    const btn_lookMoreButton = document.querySelector('.catalogue__look-more');
    const el_hiddenBlock = document.querySelector('.catalogue__filter-berries-hidden');
    
    if (!resultsContainer) {
        console.error('Основной контейнер товаров не найден');
        return;
    }

    // ====== Часть 1: Данные и состояние ======
    const templateImages = [
        './assets/sunrise.png',
        './assets/tofi.png',
        './assets/lovely.png',
        './assets/honey.png',
        './assets/moonlight.png'
    ];

    let allProducts = [];
    let filteredProducts = [];
    let currentCategory = 'box';
    let additionalProductsVisible = false;
    const initialProductsCount = 6;

    // ====== Часть 2: Основные функции ======
    function setActiveItem(item) {
        [heartItem, boxItem, plasticItem, basketItem, bouquetItem].forEach(el => {
            if (el) el.classList.remove('active');
        });
        if (item) item.classList.add('active');
    }

    function renderProducts(products) {
        resultsContainer.innerHTML = '';
        
        if (products.length === 0) {
            if (lookMoreButton) lookMoreButton.style.display = 'none';
            return;
        }
        
        products.forEach((item, index) => {
            const formattedPrice = new Intl.NumberFormat('ru-RU').format(item.priceTotal);
            const formattedOldPrice = item.priceWithoutDiscount 
                ? new Intl.NumberFormat('ru-RU').format(item.priceWithoutDiscount)
                : '';
            
            const imageIndex = index % templateImages.length;
            const productImage = templateImages[imageIndex];
            
            const hasDiscount = item.isDiscount && item.priceWithoutDiscount && 
                              (item.priceWithoutDiscount > item.priceTotal);
            
            const productHTML = `
                <div class="catalogue__result-item">
                    <img class="catalogue__result-img" src="${productImage}" alt="${item.title}" loading="lazy">
                    <div class="catalogue__result-title-and-price">
                        <div class="catalogue__result-title">${item.title}</div>
                        <div class="price-wrapper">
                            ${hasDiscount
                                ? `<span class="new-price red-price">${formattedPrice} ₽</span>
                                   <span class="old-price">${formattedOldPrice} ₽</span>`
                                : `<span class="new-price">${formattedPrice} ₽</span>`}
                        </div>
                    </div>
                    <div class="catalogue__result-button-wrapper">
                        <a class="catalogue__result-button link red-button" role="button" href="#">Добавить в корзину</a>
                    </div>
                    <div class="catalogue__result-more">Подробнее</div>
                </div>
            `;
            
            resultsContainer.insertAdjacentHTML('beforeend', productHTML);
        });
        
        if (lookMoreButton) {
            if (filteredProducts.length > initialProductsCount) {
                lookMoreButton.style.display = 'block';
                lookMoreButton.textContent = additionalProductsVisible ? 'Скрыть' : 'Посмотреть все';
            } else {
                lookMoreButton.style.display = 'none';
            }
        }
    }

    function filterProducts(products) {
        const filters = getFilters();
        console.log('Active filters:', filters);

        const berryVariants = {
            'cherry': ['вишня', 'черёмуха'],
            'blackberry': ['черника', 'ежевика'],
            'victoria': ['виктория', 'клубника'],
            'blueberry': ['голубика'],
            'raspberry': ['малина'],
            'currant': ['смородина'],
            'dewberry': ['ежевика'],
            'watermelon': ['дыня', 'арбуз'],
            'barberry': ['барбарис']
        };

        return products.filter(product => {
            if (product.priceTotal < filters.price_min || product.priceTotal > filters.price_max) {
                console.log(`Product ${product.title} filtered by price`);
                return false;
            }
            
            if (filters.with_sweets && !product.isSweets) {
                console.log(`Product ${product.title} filtered by sweets (isSweets: ${product.isSweets})`);
                return false;
            }
            
            if (filters.berries.length > 0) {
                if (!product.berryList || !Array.isArray(product.berryList)) {
                    console.log(`Product ${product.title} has no berryList array`);
                    return false;
                }
                
                const hasSelectedBerries = filters.berries.some(selectedBerryKey => {
                    const berryNames = berryVariants[selectedBerryKey] || [];
                    return berryNames.some(berryName => 
                        product.berryList.some(productBerry => 
                            productBerry.toLowerCase().includes(berryName.toLowerCase())
                        )
                    );
                });
                
                console.log(`Product ${product.title} has selected berries:`, hasSelectedBerries);
                if (!hasSelectedBerries) return false;
            }
            
            return true;
        }).sort((a, b) => {
            switch (filters.sort) {
                case 'ascending':
                    return a.priceTotal - b.priceTotal;
                case 'descending':
                    return b.priceTotal - a.priceTotal;
                case 'new':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'popular':
                    return (b.popularity || 0) - (a.popularity || 0);
                default:
                    return 0;
            }
        });
    }

    async function loadProducts(category) {
        try {
            currentCategory = category;
            const response = await fetch(`http://94.198.216.182:5050/api/listing/${category}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            allProducts = data.data || [];
            
            filteredProducts = filterProducts(allProducts);
            
            additionalProductsVisible = false;
            renderProducts(filteredProducts.slice(0, initialProductsCount));
        } catch (error) {
            console.error('Fetch error:', error);
            resultsContainer.innerHTML = '';
        }
    }

    function getFilters() {
        const sortRadio = document.querySelector('input[name="sorting"]:checked');
        const priceMin = document.querySelector('.catalogue__input-min');
        const priceMax = document.querySelector('.catalogue__input-max');
        const withSweets = document.querySelector('.toggle-input');
        const berriesCheckboxes = document.querySelectorAll('input[name="berries"]:checked');
        
        return {
            sort: sortRadio ? sortRadio.value : 'by-default',
            price_min: priceMin ? parseInt(priceMin.value) || 1500 : 1500,
            price_max: priceMax ? parseInt(priceMax.value) || 3500 : 3500,
            with_sweets: withSweets ? withSweets.checked : false,
            berries: Array.from(berriesCheckboxes).map(cb => cb.value)
        };
    }

    function applyFilters() {
        filteredProducts = filterProducts(allProducts);
        additionalProductsVisible = false;
        renderProducts(filteredProducts.slice(0, initialProductsCount));
    }

    // ====== Часть 3: Работа с событиями ======
    function setupEventListeners() {
        if (heartItem) {
            heartItem.addEventListener('click', () => {
                loadProducts('heart');
                setActiveItem(heartItem);
            });
        }
        
        if (boxItem) {
            boxItem.addEventListener('click', () => {
                loadProducts('box');
                setActiveItem(boxItem);
            });
        }
        
        if (plasticItem) {
            plasticItem.addEventListener('click', () => {
                loadProducts('plastic');
                setActiveItem(plasticItem);
            });
        }
        
        if (basketItem) {
            basketItem.addEventListener('click', () => {
                loadProducts('basket');
                setActiveItem(basketItem);
            });
        }
        
        if (bouquetItem) {
            bouquetItem.addEventListener('click', () => {
                loadProducts('bouquet');
                setActiveItem(bouquetItem);
            });
        }

        if (lookMoreButton) {
            lookMoreButton.addEventListener('click', function() {
                additionalProductsVisible = !additionalProductsVisible;
                
                if (additionalProductsVisible) {
                    renderProducts(filteredProducts);
                } else {
                    renderProducts(filteredProducts.slice(0, initialProductsCount));
                }
            });
        }

        document.querySelectorAll('input[name="sorting"]').forEach(radio => {
            radio.addEventListener('change', applyFilters);
        });
        
        const priceMin = document.querySelector('.catalogue__input-min');
        const priceMax = document.querySelector('.catalogue__input-max');
        
        if (priceMin) priceMin.addEventListener('change', applyFilters);
        if (priceMax) priceMax.addEventListener('change', applyFilters);
        
        document.querySelectorAll('input[name="berries"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        const withSweets = document.querySelector('.toggle-input');
        if (withSweets) withSweets.addEventListener('change', applyFilters);
    }

    function cleanupEventListeners() {
        // Удаляем обработчики категорий
        if (heartItem) heartItem.removeEventListener('click', () => loadProducts('heart'));
        if (boxItem) boxItem.removeEventListener('click', () => loadProducts('box'));
        if (plasticItem) plasticItem.removeEventListener('click', () => loadProducts('plastic'));
        if (basketItem) basketItem.removeEventListener('click', () => loadProducts('basket'));
        if (bouquetItem) bouquetItem.removeEventListener('click', () => loadProducts('bouquet'));

        // Удаляем обработчик кнопки "Посмотреть все"
        if (lookMoreButton) {
            lookMoreButton.removeEventListener('click', function() {
                additionalProductsVisible = !additionalProductsVisible;
                if (additionalProductsVisible) {
                    renderProducts(filteredProducts);
                } else {
                    renderProducts(filteredProducts.slice(0, initialProductsCount));
                }
            });
        }

        // Удаляем обработчики фильтров
        document.querySelectorAll('input[name="sorting"]').forEach(radio => {
            radio.removeEventListener('change', applyFilters);
        });
        
        const priceMin = document.querySelector('.catalogue__input-min');
        const priceMax = document.querySelector('.catalogue__input-max');
        if (priceMin) priceMin.removeEventListener('change', applyFilters);
        if (priceMax) priceMax.removeEventListener('change', applyFilters);
        
        document.querySelectorAll('input[name="berries"]').forEach(checkbox => {
            checkbox.removeEventListener('change', applyFilters);
        });
        
        const withSweets = document.querySelector('.toggle-input');
        if (withSweets) withSweets.removeEventListener('change', applyFilters);
    }

    // ====== Часть 4: Инициализация ценового фильтра ======
    function initPriceFilter() {
        if (btn_lookMoreButton && el_hiddenBlock) {
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

        if (el_rangeMin && el_rangeMax && inp_inputMin && inp_inputMax && el_progress) {
            // Убираем атрибут readonly для полей ввода
            inp_inputMin.removeAttribute('readonly');
            inp_inputMax.removeAttribute('readonly');
            
            const minVal = parseInt(el_rangeMin.min, 10);
            const maxVal = parseInt(el_rangeMax.max, 10);
            const minGap = 100;
            
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
                
                if (minValue > maxValue - minGap) {
                    minValue = maxValue - minGap;
                    el_rangeMin.value = minValue;
                }
                
                inp_inputMin.value = minValue;
                updateProgress();
                applyFilters();
            }
            
            function updateMaxInput() {
                let minValue = parseInt(el_rangeMin.value, 10);
                let maxValue = parseInt(el_rangeMax.value, 10);
                
                if (maxValue < minValue + minGap) {
                    maxValue = minValue + minGap;
                    el_rangeMax.value = maxValue;
                }
                
                inp_inputMax.value = maxValue;
                updateProgress();
                applyFilters();
            }
            
            el_rangeMin.addEventListener('input', updateMinInput);
            el_rangeMax.addEventListener('input', updateMaxInput);
            
            inp_inputMin.addEventListener('input', function() {
                let value = parseInt(this.value) || minVal;
                let maxValue = parseInt(inp_inputMax.value, 10);
                
                // Проверяем, чтобы значение было в допустимых пределах
                if (value < minVal) value = minVal;
                if (value > maxVal) value = maxVal;
                
                // Проверяем минимальный разрыв
                if (value > maxValue - minGap) {
                    value = maxValue - minGap;
                    this.value = value;
                }
                
                el_rangeMin.value = value;
                updateProgress();
                applyFilters();
            });
            
            inp_inputMax.addEventListener('input', function() {
                let value = parseInt(this.value) || maxVal;
                let minValue = parseInt(inp_inputMin.value, 10);
                
                // Проверяем, чтобы значение было в допустимых пределах
                if (value < minVal) value = minVal;
                if (value > maxVal) value = maxVal;
                
                // Проверяем минимальный разрыв
                if (value < minValue + minGap) {
                    value = minValue + minGap;
                    this.value = value;
                }
                
                el_rangeMax.value = value;
                updateProgress();
                applyFilters();
            });
            
            // Обработчики для blur (когда поле теряет фокус)
            inp_inputMin.addEventListener('blur', function() {
                let value = parseInt(this.value) || minVal;
                if (value < minVal) {
                    value = minVal;
                    this.value = value;
                }
                el_rangeMin.value = value;
                updateMinInput();
            });
            
            inp_inputMax.addEventListener('blur', function() {
                let value = parseInt(this.value) || maxVal;
                if (value > maxVal) {
                    value = maxVal;
                    this.value = value;
                }
                el_rangeMax.value = value;
                updateMaxInput();
            });
            
            updateMinInput();
            updateMaxInput();
            updateProgress();
        }
    }

    // ====== Часть 5: Инициализация и запуск ======
    function init() {
        setupEventListeners();
        initPriceFilter();
        
        if (boxItem) {
            boxItem.classList.add('active');
            loadProducts('box');
        }
    }

    // Делаем функцию очистки доступной извне
    window.catalogueCleanup = cleanupEventListeners;

    // Запуск при полной загрузке DOM
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();