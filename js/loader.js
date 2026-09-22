/**
 * Yükleme ve Hata ekranı yönetimi.
 */

const loaderEl = document.getElementById('loader');
const loaderTextEl = document.getElementById('loader-text');
const errorScreenEl = document.getElementById('error-screen');
const errorTextEl = document.getElementById('error-text');

export function showLoader() {
    if (loaderEl) {
        loaderEl.classList.remove('hidden');
    }
}

export function hideLoader() {
    if (loaderEl) {
        loaderEl.classList.add('hidden');
    }
}

export function updateLoaderText(text) {
    if (loaderTextEl) {
        loaderTextEl.textContent = text;
    }
}

export function showError(message) {
    hideLoader();
    if (errorScreenEl && errorTextEl) {
        errorTextEl.textContent = message;
        errorScreenEl.classList.remove('hidden');
    }
    console.error("Uygulama Hatası:", message);
}

// Hata ekranını kapatma
const btnErrorClose = document.getElementById('btn-error-close');
if (btnErrorClose && errorScreenEl) {
    btnErrorClose.addEventListener('click', () => {
        errorScreenEl.classList.add('hidden');
    });
}
