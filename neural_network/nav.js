const nav = document.getElementById('nav');
const hiddenNav = document.getElementById('hiddenNav');
nav.addEventListener('click', () => {
    hiddenNav.classList.toggle('active');
});