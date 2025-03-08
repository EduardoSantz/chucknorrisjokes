let currentJoke = null;
const API_BASE_URL = 'https://chucknorrisjokes-eduardo.up.railway.app'; // Atualize com sua URL Railway

const elements = {
    jokeContainer: document.getElementById('joke-container'),
    chuckImage: document.getElementById('chuck-image'),
    favoritesList: document.getElementById('favorites-list'),
    favoriteTemplate: document.getElementById('favorite-template')
};

document.getElementById('new-joke-btn').addEventListener('click', getNewJoke);
document.getElementById('favorite-btn').addEventListener('click', addToFavorites);

async function getNewJoke() {
    try {
        const response = await fetch('https://api.chucknorris.io/jokes/random');
        const data = await response.json();
        
        currentJoke = {
            id: data.id,
            text: data.value,
            image: data.icon_url
        };
        
        elements.jokeContainer.textContent = data.value;
        elements.chuckImage.src = data.icon_url;
    } catch (error) {
        console.error('Erro:', error);
        elements.jokeContainer.textContent = 'Chuck Norris quebrou o servidor... Tente novamente!';
    }
}

async function addToFavorites() {
    if (!currentJoke) return;

    try {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentJoke)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        loadFavorites();
    } catch (error) {
        console.error('Erro ao favoritar:', error);
        alert('Erro ao favoritar: ' + error.message);
    }
}

async function deleteFavorite(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Falha ao remover favorito');
        }
        
        loadFavorites();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir: ' + error.message);
    }
}

async function loadFavorites() {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites`);
        const favorites = await response.json();
        
        elements.favoritesList.innerHTML = favorites.length ? '' : '<p>Nenhum favorito salvo ainda!</p>';

        favorites.forEach(fav => {
            const clone = elements.favoriteTemplate.content.cloneNode(true);
            const item = clone.querySelector('.favorite-item');
            
            item.querySelector('.favorite-img').src = fav.image;
            item.querySelector('.favorite-text').textContent = fav.text;
            item.querySelector('.delete-btn').addEventListener('click', () => deleteFavorite(fav.id));
            
            elements.favoritesList.appendChild(clone);
        });
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        elements.favoritesList.innerHTML = '<p>Erro ao carregar favoritos</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getNewJoke();
    loadFavorites();
});