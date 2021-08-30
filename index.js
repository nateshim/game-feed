//CREDENTIALS
const igdbUrl = 'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4'; 
const clientID = '03ktyk7tynafougy2affcczbqjhoi7';
const clientSecret = 'quuj42etoeh1fstmfiv9wpvhv9yq3p';

//GLOBAL VARIABLES
const searchForm = document.querySelector('#form');
const aboutButtons = document.querySelectorAll('.about-button');
const contactButtons = document.querySelectorAll('.contact-button');

//OAUTH
const getCredentials = async () => {
  const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`);
  const token = response.data.access_token;
  //SETTING UP DEFAULT HEADERS FOR AUTHORIZATION
  axios.defaults.headers.common['Client-ID'] = clientID;
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  console.log("This is the token: " + token);
  
  //getTenRandomGames(token);
  //getGenres();

} 

//AXIOS GET FUNCTIONS
const getGenres = async (token) => {
  try {
    const response = await axios.get(`${igdbUrl}/genres`, {
      params: {
        fields: "name",
        limit: 23,
      }
    });
    console.log(response);
    const genres = response.data;
    renderGenres(genres);
  } catch (error) {
    console.log(error);
  }
}

const getGames = async (userInput) => {
  try {
    const response = await axios.get(`${igdbUrl}/games`, {
      params: {
        fields: 'cover.*, *',
        search: userInput,
        limit: 20
      }
    });
    const games = response.data;
    console.log(games);
    renderGames(games);
  } catch (error) {
    console.log(error);
  }
}

const getTenRandomGames = async (token) => {
  try {
    const response = await axios.get(`${igdbUrl}/games`, {
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


//RENDER FUNCTIONS
const renderGames = (games) => {
  const gamesDiv = document.querySelector('#games');
  games.forEach((game) => {
    const gameContainer = document.createElement('div');
    const gameImg = document.createElement('img');
    console.log(game.cover.url);
    const gameCoverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.png`;
    
    gameImg.src = gameCoverUrl;
    gameImg.classList.add('game-img');
    gameContainer.appendChild(gameImg);
    gameContainer.classList.add('game-container');

    gamesDiv.appendChild(gameContainer);
  })
  searchForm.style.display = 'none';
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