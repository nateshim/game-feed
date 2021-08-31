//CREDENTIALS
const igdbUrl = 'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4'; 
const clientID = '03ktyk7tynafougy2affcczbqjhoi7';
const clientSecret = 'quuj42etoeh1fstmfiv9wpvhv9yq3p';
let token = '';

//GLOBAL VARIABLES
const searchForm = document.querySelector('#form');
const aboutButtons = document.querySelectorAll('.about-button');
const contactButtons = document.querySelectorAll('.contact-button');

//OAUTH
const getCredentials = async () => {
  try {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`);
    token = response.data.access_token;
    axios.defaults.headers.common['Client-ID'] = clientID;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("This is the token: " + token);
  } catch (error) {
    console.log(error);
  }
  //getTenRandomGames(token);
} 

//AXIOS GET FUNCTIONS
const getGames = async (userInput) => {
  try {
    const response = await axios.get(`${igdbUrl}/games`, {
      headers: {
        'Client-ID': clientID,
        'Authorization': `Bearer ${token}`,
      },
      params: {
        fields: 'cover.image_id, id',
        search: userInput,
        limit: 20
      }
    });
    const games = response.data;
    console.log("These are the games");
    console.log(games);
    renderGames(games);
  } catch (error) {
    console.log(error);
  }
}

const getGameInfo = async (gameID) => {
  try {
    //all ids are in the format id${gameID} (ex. id2707) so we use substring to remove the 'id' part of the string
    const id = gameID.substring(2);
    const response = await axios.get(`${igdbUrl}/games/${id}`, {
      headers: {
        'Client-ID': clientID,
        'Authorization': `Bearer ${token}`,
      },
      params: {
        fields: 'cover.image_id, genres, involved_companies, name, rating, release_dates',
        limit: 1, 
      },
    });
    console.log("This is the game selected");
    console.log(response);
    const game = response.data[0];
    const genres = await getGameGenres(game.genres);
    const developers = await getGameDevelopers(game.involved_companies);
    const releaseDates = await getYearOfRelease(game.release_dates);
    renderGameInfo(game, genres, developers, releaseDates);
  } catch (error) {
    console.log(error);
  }
}

const getGameGenres = async (genres) => {
  const genreArray = [];
  try {
    for (genre of genres) {
      const response = await axios.get(`${igdbUrl}/genres/${genre}`, {
        headers: {
          'Client-ID': clientID,
          'Authorization': `Bearer ${token}`,
        },
        params: {
          fields: 'name',
          limit: 1,
        }
      });
      genreArray.push(response.data[0].name);
    }
    return genreArray;
  } catch (error) {
    console.log(error);
  }
}

const getGameDevelopers = async (developers) => {
  const developerArray = [];
  try {
    for (developer of developers) {
      const response = await axios.get(`${igdbUrl}/involved_companies/${developer}`, {
        headers: {
          'Client-ID': clientID,
          'Authorization': `Bearer ${token}`,
        },
        params: {
          fields: 'company',
          limit: 1,
        }
      });
      const gameDeveloper = await axios.get(`${igdbUrl}/companies/${response.data[0].company}`, {
        headers: {
          'Client-ID': clientID,
          'Authorization': `Bearer ${token}`
        },
        params: {
          fields: 'name',
          limit: 1,
        }
      });
      console.log(gameDeveloper);
      genreArray.push(gameDeveloper.data[0].name);
    }
    return developerArray;
  } catch (error) {
    console.log(error);
  }
}

const getTenRandomGames = async (token) => {
  try {
    const response = await axios.get(`${igdbUrl}/games`, {
      headers: {
        'Client-ID': clientID,
        'Authorization': `Bearer ${token}`,
      },
      params: {
        fields: "name",
        limit: 10
      }
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  } 
}

const getYearOfRelease = async (releaseDates) => {
  const releaseDatesArray = [];
  try {
    for (releaseDate of releaseDates) {
      const response = axios.get(`${igdbUrl}/release_dates/${releaseDate}`, {
        headers: {
          'Client-ID': clientID,
          'Authorization': `Bearer ${token}`,
        },
        params: {
          fields: "date",
          limit: 1
        }
      });
      releaseDatesArray.push(response.data[0].date);
    }
    return releaseDatesArray;
  } catch (error) {
    console.log(error);
  }
}

//RENDER FUNCTIONS
const renderGames = (games) => {
  const gamesDiv = document.querySelector('#games');
  searchForm.style.display = 'none';
  games.forEach((game) => {
    const gameContainer = document.createElement('div');
    const gameImg = document.createElement('img');
    const gameCoverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.png`;
    
    gameImg.src = gameCoverUrl;
    gameImg.classList.add('game-img');
    gameImg.setAttribute('id',`id${game.id}`);
    gameContainer.appendChild(gameImg);
    gameContainer.classList.add('game-container');
    gameContainer.addEventListener('click', toggleGameInfo);
    gamesDiv.appendChild(gameContainer);
  });
}

const renderGameInfo = (game, genres, developers, releaseDates) => {
  const gameImg = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.png`;
  const gameTitle = game.name;
  const gameRating = game.rating;
  const gameReleaseDates = game.release_dates;

  const gameModal = document.querySelector('#game-modal');
  const gamesContainer = document.querySelector('#games');
  gameModal.style.display = "flex";
  gamesContainer.style.display = "none";

  const gameModalImage = document.querySelector('#game-modal-image');
  gameModalImage.src = gameImg;
  const gameModalTitle = document.querySelector('#game-title');
  gameModalTitle.innerText = gameTitle;
  const gameModalGenres = document.querySelector('#game-genres');
  gameModalGenres.innerText = genres;
  const gameModalDeveloper = document.querySelector('#game-developer');
  gameModalDeveloper.innerText = developers;
  const gameModalRating = document.querySelector('#game-rating');
  gameModalRating.innerText = Math.round(gameRating * 10) / 10 + " / 100";
  const gameModalYearOfRelease = document.querySelector('#game-year-of-release');
  gameModalYearOfRelease.innerText = releaseDates;

}

const renderGenres = (genres) => {
  const select = document.querySelector('select');
  genres.forEach((genre) => {
    const optionEl = document.createElement('option');
    optionEl.value = genre.name;
    optionEl.innerHTML = genre.name;
    select.appendChild(optionEl);
  })
}

//EVENT HANDLERS
const handleSearch = (event) => {
  event.preventDefault();
  const inputEl = document.querySelector('#query');
  const userInput = inputEl.value;
  getGames(userInput);
}

const toggleGameInfo = (event) => {
  const gameID = event.target.id;
  getGameInfo(gameID);
}

const toggleSection = (event) => {
  const homeSection = document.querySelector('#home');
  const aboutSection = document.querySelector('#about');
  const contactSection = document.querySelector('#contact');
  switch (event.target.classList[1]) {
    case 'about-button':
      homeSection.style.display = 'none';
      aboutSection.style.display = 'flex';
      contactSection.style.display = 'none';
      break;
    case 'contact-button':
      homeSection.style.display = 'none';
      aboutSection.style.display = 'none';
      contactSection.style.display = 'flex';
      break;
  }
}

//EVENT LISTENERS AND ONLOAD FUNCTIONS
searchForm.addEventListener('submit', handleSearch);
aboutButtons.forEach((aboutButton) => {
  aboutButton.addEventListener('click', toggleSection);
});
contactButtons.forEach((contactButton) => {
  contactButton.addEventListener('click', toggleSection);
})

getCredentials();