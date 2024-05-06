const API_KEY = 'e6e042fdd410c00b3915bad7d56d4d24';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = `${BASE_URL}/search/movie?api_key=${API_KEY}`;
const actorSearchURL = `${BASE_URL}/search/person?api_key=${API_KEY}`;


let currentPage = 1;
const resultsPerPage = 24;
let totalResults = 0;
let currentResults = [];
let currentSearchQuery = ''; 

// Lista med genrer
const genres = [
    {"id": 28, "name": "Action"}, 
    {"id": 12, "name": "Adventure"},
    {"id": 16, "name": "Animation"}, 
    {"id": 35, "name": "Comedy"},
    {"id": 80, "name": "Crime"}, 
    {"id": 99, "name": "Documentary"},
    {"id": 18, "name": "Drama"}, 
    {"id": 10751, "name": "Family"},
    {"id": 14, "name": "Fantasy"}, 
    {"id": 36, "name": "History"},
    {"id": 27, "name": "Horror"}, 
    {"id": 10402, "name": "Music"},
    {"id": 9648, "name": "Mystery"}, 
    {"id": 10749, "name": "Romance"},
    {"id": 878, "name": "Science Fiction"}, 
    {"id": 10770, "name": "TV Movie"},
    {"id": 53, "name": "Thriller"}, 
    {"id": 10752, "name": "War"},
    {"id": 37, "name": "Western"}
];

let selectedGenre = []; 

function handleError(error, userCanRetry) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block'; 

    if (userCanRetry) {
        errorMessage.innerText = "Inga resultat hittades för din sökning. Försök med andra söktermer.";
    } else {
        errorMessage.innerText = "Ett tekniskt fel uppstod. Vänligen försök igen senare. " + (error ? error.message : '');
    }
}

// Rensar felmeddelanden
function clearErrorMessage() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none'; 
        errorMessage.innerText = ''; 
    }
}

// Markerar val
function highlightSelection() {

}

// Laddar hemsidan och funktioner
document.addEventListener('DOMContentLoaded', function() {
    // Hantera klick på hemlänken
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            location.reload();
        });
    }

    // Visar topprankade filmer
    getTopRatedMovies();

    // Visar populära filmer
    getPopularMovies();

    attachSearchEventListeners();

    setGenre();

    let header = document.getElementById('search-results-header');
    if (header) {
        header.style.display = 'none';
    }
    let loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }
});

function attachSearchEventListeners() {
    const form = document.getElementById('search-form');
    form.addEventListener('submit', handleFormSubmit);

    const loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMoreResults);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('search-input').value.trim();
    const isMoviesChecked = document.getElementById('search-movies-checkbox').checked;
    const isActorsChecked = document.getElementById('search-actors-checkbox').checked;

    if (!searchTerm) {
        return; 
    }

    currentSearchQuery = searchTerm;

    if (isMoviesChecked) {
        searchMovies(searchTerm);
    }
    if (isActorsChecked) {
        searchActors(searchTerm);
    }
}

function setGenre() {
    const tagsEl = document.getElementById('tags');
    tagsEl.innerHTML = '';
    genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id = genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', () => {
            const genreName = genre.name; 
            showGenreHeader(genreName); 
            if (selectedGenre.includes(genre.id)) {
                selectedGenre = selectedGenre.filter(id => id !== genre.id);
            } else {
                selectedGenre.push(genre.id);
            }
            getMoviesByGenre(selectedGenre);
            highlightSelection();
        });
        tagsEl.appendChild(t);
    });
}
showGenreHeader(""); 

// Filmer baserat på valda genrer
function getMoviesByGenre(genres) {
    selectedGenre = [];
    const genreQuery = genres.join(',');
    const url = `${API_URL}&with_genres=${encodeURIComponent(genreQuery)}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.results.length === 0) {
                handleError(null, true); 
            } else {
                currentResults = data.results;
                displayCurrentPageResults();
            }
        })
        .catch(error => {
            handleError(error, false); 
        });
}

// Rubrik för vald genre
function showGenreHeader(genreName) {
    const searchResultsHeader = document.getElementById('search-results-header');
    if (searchResultsHeader) {
        searchResultsHeader.style.display = 'block'; 
        searchResultsHeader.innerHTML = `<h2>${genreName} Movies</h2>`; 
    }
}

function displayCurrentPageResults() {
    const start = (currentPage - 1) * resultsPerPage;
    let end = start + resultsPerPage;
    
    if (end > currentResults.length) {
        end = currentResults.length;
    }

    const resultsToDisplay = currentResults.slice(start, end);

    var container = document.getElementById('search-results-container'); 
    if (!container) {
        console.error("Container element 'search-results-container' not found.");
        return;
    }
    
    container.innerHTML = ''; 

    resultsToDisplay.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        
        if (result.poster_path) {
            resultElement.innerHTML = `
                <img src="${IMG_URL + result.poster_path}" alt="${result.title}">
                <div>
                    <h3>${result.title}</h3>
                    <p>Release date: ${result.release_date}</p>
                    <p>${result.overview}</p> <!-- Beskrivning för filmen -->
                    <a href="#" class="more-info-link" data-movie-id="${result.id}">Show more info</a>
                </div>
            `;
        } else if (result.profile_path) {
            let knownForContent = '';
            result.known_for.forEach(item => {
                const mediaType = item.media_type === 'movie' ? 'Movie' : 'TV';
                knownForContent += `<li>${mediaType}: ${item.title || item.name}</li>`;
            });
    
            resultElement.innerHTML = `
                <img src="${IMG_URL + result.profile_path}" alt="${result.name}" title="${result.name}">
                <div>
                    <h3>${result.name}</h3>
                    <p>Known for: ${result.known_for_department}</p>
                    <ul class="known-for-list">${knownForContent}</ul>
                    <a href="#" class="more-info-link" data-actor-id="${result.id}">Show more info</a>
                </div>
            `;
        }
        
        container.appendChild(resultElement);
    });

    container.querySelectorAll('.more-info-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const movieId = this.getAttribute('data-movie-id');
            const actorId = this.getAttribute('data-actor-id');
            if (movieId) {
                showMoreInfo(movieId);
            } else if (actorId) {
                showMoreInfo(actorId);
            }
        });
    });

    const loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.style.display = end < currentResults.length ? 'block' : 'none';
    }
}

function loadMoreResults() {
    currentPage++;
    displayCurrentPageResults();
}

// Visar mer information om film/skådespelare på webbplatsen
function showMoreInfo(movieId) {
    const tmdbUrl = `https://www.themoviedb.org/movie/${movieId}`;
    window.open(tmdbUrl, '_blank');
}

// Visar sökresultat för filmer eller skådespelare
function displaySearchResults(results, type) {
    const container = document.getElementById('search-results-container');
    if (!container) {
        console.error("Container element 'search-results-container' not found.");
        return;
    }

    container.innerHTML = ''; 

    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        if (type === 'movie') {
            resultElement.innerHTML = `
                <img src="${IMG_URL + result.poster_path}" alt="${result.title}">
                <div>
                    <h3>${result.title}</h3>
                    <p>Release date: ${result.release_date}</p>
                    <p>${result.overview}</p> <!-- Beskrivning för filmen -->
                </div>
            `;
        } else {
            let knownForContent = '';
            result.known_for.forEach(item => {
                const mediaType = item.media_type === 'movie' ? 'Movie' : 'TV';
                knownForContent += `<li>${mediaType}: ${item.title || item.name}</li>`;
            });

            resultElement.innerHTML = `
                <img src="${IMG_URL + result.profile_path}" alt="${result.name}" title="${result.name}">
                <div>
                    <h3>${result.name}</h3>
                    <p>Known for: ${result.known_for_department}</p>
                    <ul class="known-for-list">${knownForContent}</ul>
                </div>
            `;
        }
        container.appendChild(resultElement);
    });

    const loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.style.display = results.length < totalResults ? 'block' : 'none';
    }
}

// Söker efter filmer baserat på inmatning
function searchMovies(query) {
    const url = `${searchURL}&query=${encodeURIComponent(query)}`;
    console.log('API-anrop till:', url);  
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Nätverksfel vid hämtning av filmer');
            return response.json();
        })
        .then(data => {
            if (data.results.length === 0) {
                handleError(null, true);
            } else {
                currentResults = data.results;
                totalResults = data.total_results;
                displaySearchResults(currentResults, 'movie');
            }
        })
        .catch(error => {
            console.error('Fel vid sökning av filmer:', error);
            handleError(error, false);
        });
}

// Söker efter skådespelare baserat på inmatning
function searchActors(query) {
    const url = `${actorSearchURL}&query=${encodeURIComponent(query)}`;
    console.log('API-anrop till:', url);  
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Nätverksfel vid hämtning av skådespelare');
            return response.json();
        })
        .then(data => {
            if (data.results.length === 0) {
                handleError(null, true);
            } else {
                currentResults = data.results;
                totalResults = data.total_results;
                displaySearchResults(currentResults, 'person');
            }
        })
        .catch(error => {
            console.error('Fel vid sökning av skådespelare:', error);
            handleError(error, false);
        });
}

// Visar filmer
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';  

    movies.slice(0, 12).forEach(movie => { // Ändra här till 12 istället för 10
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Release date: ${movie.release_date}</p>
            </div>
            <div class="overview">
                <a href="#" class="show-more-info" data-movie-id="${movie.id}">Show More Info</a>
            </div>
        `;
        container.appendChild(movieElement);
    });

    container.querySelectorAll('.show-more-info').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const movieId = event.target.dataset.movieId;
            showMoreInfo(movieId);
        });
    });
}

// Hämtar topprankade filmer
function getTopRatedMovies() {
    const url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const topTenMovies = data.results.slice(0, 12);
            displayMovies(topTenMovies, 'top-rated-movies');
        })
        .catch(error => console.error('Error fetching top rated movies:', error));
}

// Hämtar populära filmer
function getPopularMovies() {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const topTenMovies = data.results.slice(0, 12);
            displayMovies(topTenMovies, 'popular-movies');
        })
        .catch(error => console.error('Error fetching popular movies:', error));
}
