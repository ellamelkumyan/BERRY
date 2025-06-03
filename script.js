document.querySelector('.hit__button-prev').addEventListener('click', () => {
    const wrapper = document.querySelector('.hit__wrapper');
    const items = document.querySelectorAll('.hit__item');
    if (items.length < 3) return;

    const firstVisibleIndex = Math.round(wrapper.scrollLeft / items[0].offsetWidth);
    const targetIndex = Math.max(0, firstVisibleIndex - 3);

    wrapper.scrollTo({
        left: items[targetIndex].offsetLeft,
        behavior: 'smooth'
    });
});

document.querySelector('.hit__button-next').addEventListener('click', () => {
    const wrapper = document.querySelector('.hit__wrapper');
    const items = document.querySelectorAll('.hit__item');
    if (items.length < 3) return;

    const firstVisibleIndex = Math.round(wrapper.scrollLeft / items[0].offsetWidth);
    const targetIndex = Math.min(items.length - 3, firstVisibleIndex + 3);

    wrapper.scrollTo({
        left: items[targetIndex].offsetLeft,
        behavior: 'smooth'
    });
});