const currentJoke = null;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Configurado via Vercel

const elements = {
    jokeContainer: document.getElementById('joke-container'),
    chuckImage: document.getElementById('chuck-image'),
    favoritesList: document.getElementById('favorites-list'),
    favoriteTemplate: document.getElementById('favorite-template')
};

// Event Listeners
document.getElementById('new-joke-btn').addEventListener('click', getNewJoke);
document.getElementById('favorite-btn').addEventListener('click', addToFavorites);

// Função para tratamento seguro de respostas
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
}

// Obter nova piada
async function getNewJoke() {
    try {
        const data = await fetch('https://api.chucknorris.io/jokes/random')
            .then(handleResponse);

        currentJoke = {
            id: data.id,
            text: data.value,
            image: data.icon_url || 'img/default-chuck.png'
        };

        elements.jokeContainer.textContent = data.value;
        elements.chuckImage.src = currentJoke.image;
        elements.chuckImage.alt = `Piada: ${data.value.substring(0, 50)}...`;
    } catch (error) {
        console.error('Erro:', error);
        showError('Chuck Norris quebrou o servidor... Tente novamente!');
    }
}

// Adicionar aos favoritos
async function addToFavorites() {
    if (!currentJoke) return;

    try {
        await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentJoke)
        }).then(handleResponse);

        loadFavorites();
    } catch (error) {
        console.error('Erro ao favoritar:', error);
        showError(error.message);
    }
}

// Carregar favoritos
async function loadFavorites() {
    try {
        const favorites = await fetch(`${API_BASE_URL}/favorites`)
            .then(handleResponse);

        elements.favoritesList.innerHTML = favorites.length ? '' : '<p class="empty">Nenhum favorito salvo ainda!</p>';

        favorites.forEach(fav => {
            const clone = elements.favoriteTemplate.content.cloneNode(true);
            clone.querySelector('.favorite-item').dataset.id = fav.id;
            clone.querySelector('.favorite-img').src = fav.image || 'img/default-chuck.png';
            clone.querySelector('.favorite-text').textContent = fav.text;
            clone.querySelector('.delete-btn').addEventListener('click', () => deleteFavorite(fav.id));
            
            elements.favoritesList.appendChild(clone);
        });
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        elements.favoritesList.innerHTML = '<p class="error">Erro ao carregar favoritos</p>';
    }
}

// Deletar favorito
async function deleteFavorite(id) {
    try {
        await fetch(`${API_BASE_URL}/favorites/${id}`, {
            method: 'DELETE'
        }).then(handleResponse);
        
        loadFavorites();
    } catch (error) {
        console.error('Erro:', error);
        showError(error.message);
    }
}

// Exibir erros
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    getNewJoke();
    loadFavorites();
});