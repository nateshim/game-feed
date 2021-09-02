//CREDENTIALS
const igdbUrl = 'https://cors-lite.herokuapp.com/https://api.igdb.com/v4'; 
const clientID = '03ktyk7tynafougy2affcczbqjhoi7';
const clientSecret = 'quuj42etoeh1fstmfiv9wpvhv9yq3p';
let token = '';
let userInput = '';

//GLOBAL VARIABLES
const searchForm = document.querySelector('#search');
const developerForm = document.querySelector('#developer');
const aboutButtons = document.querySelectorAll('.about-button');
const contactButtons = document.querySelectorAll('.contact-button');
const featuresButton = document.querySelector('.features-button');
const featuresTitleLinks = document.querySelectorAll('.features-title-link');
const featuresDeveloperLinks = document.querySelectorAll('.features-developer-link');

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
const getGames = async (userInput, page) => {
  try {
    renderLoadingScreen();
    const response = await axios.get(`${igdbUrl}/games`, {
      params: {
        fields: 'cover.image_id, id',
        search: userInput,
        offset: 20 * page,
        limit: 20
      }
    });
    const games = response.data;
    console.log(games);
    if (games.length === 0) {
      if(!alert('No games found for that title...')){window.location.reload();}
    }
    renderGames(games);
  } catch (error) {
    console.log(error);
  }
}

const getDeveloperGames = async (userInput, page) => {
  const gamesArray = [];
  try {
    renderLoadingScreen();
    const response = await axios.get(`${igdbUrl}/companies`, {
      params: {
        fields: 'developed',
        name: userInput,
        offset: 20 * page,
        limit: 20
      }
    });
    console.log(response);
    const games = response.data[0].developed;
    if (games.length === 0) {
      if(!alert('No games found for that title...')){window.location.reload();}
    }
    await Promise.all(
      games.map(async (game) => {
        const response = await axios.get(`${igdbUrl}/games/${game}`, {
          params: {
            fields: 'cover.image_id, id',
            limit: 1,
          }
        });
        gamesArray.push(response.data[0]);
      })
    )
    renderGames(gamesArray);
  } catch (error) {
    console.log(error);
  }
}

const getNumOfGames = async (userInput) => {
  try {
    const response = await axios.get(`${igdbUrl}/games/count`, {
      params: {
        search: userInput
      }
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

const getGameInfo = async (gameID) => {
  try {
    renderLoadingScreen();
    //all ids are in the format id${gameID} (ex. id2707) so we use substring to remove the 'id' part of the string
    const id = gameID.substring(2);
    const response = await axios.get(`${igdbUrl}/games/${id}`, {
      params: {
        fields: 'cover.image_id, genres, involved_companies, name, rating, release_dates, screenshots.image_id, videos.video_id',
        limit: 1, 
      },
    });
    console.log("This is the game selected");
    console.log(response);
    const game = response.data[0];
    const [genres, developers, releaseDates] = await Promise.all([getGameGenres(game.genres), getGameDevelopers(game.involved_companies), getYearOfRelease(game.release_dates)]);
    //check if videos actually has something
    (game.videos) ? 
    renderGameInfo(game, genres, developers, releaseDates, game.videos[0].video_id) :
    renderGameInfo(game, genres, developers, releaseDates, 'No video found') ;
  } catch (error) {
    console.log(error);
  }
}

const getGameGenres = async (genres) => {
  const genreArray = [];
  try {
    await Promise.all(
      genres.map(async (genre) => {
        const response = await axios.get(`${igdbUrl}/genres/${genre}`, {
          params: {
            fields: 'name',
            limit: 1,
          }
        });
        (response.data) ? genreArray.push(response.data[0].name) : genreArray.push('No genre found');
      })
    );
    return genreArray;
  } catch (error) {
    console.log(error);
  }
}

const getGameDevelopers = async (developers) => {
  const developerArray = [];
  try {
    await Promise.all(
      developers.map(async (developer) => {
        const response = await axios.get(`${igdbUrl}/involved_companies/${developer}`, {
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
        (gameDeveloper.data) ? developerArray.push(gameDeveloper.data[0].name) : developerArray.push('No developer found');
      })
    )
    return developerArray;
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

const getYearOfRelease = async (releaseDates) => {
  const releaseDatesArray = [];
  try {
    const releaseDate = releaseDates[0];
    const response = await axios.get(`${igdbUrl}/release_dates/${releaseDate}`, {
      params: {
        fields: "date",
        limit: 1
      }
    });
    if (response.data.length > 0) {
      const date = new Date(response.data[0].date*1000);
      date.setDate(date.getDate() + 1);
      releaseDatesArray.push(date.toLocaleDateString("default", {month: 'long', day: 'numeric', year: 'numeric'}));
    } else {
      releaseDatesArray.push('No year of release found.');
    }
    return releaseDatesArray;
  } catch (error) {
    console.log(error);
  }
}

//RENDER FUNCTIONS
const renderGames = (games) => {
  const gamesDiv = document.querySelector('#games');
  gamesDiv.innerHTML = "";
  searchForm.style.display = 'none';
  renderCurrScreen();
  let errorCounter = 0;
  games.forEach((game) => {
    if(game.cover) {
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
    } else {
      errorCounter += 1;
    }
    if(errorCounter === games.length) {
      if(!alert('No games found for that title...')){window.location.reload();}
    }
  });
  renderPages();
}

const renderPages = () => {
  const searchPages = document.querySelector('#search-pages');
  searchPages.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('search-page-button');
    pageButton.id = i;
    pageButton.innerText = i+1;
    pageButton.addEventListener('click', handlePageSearch);
    searchPages.appendChild(pageButton);
  }
  
}

const clearGameModal = () => {
  const gameModalInfo = document.querySelector('#game-modal-info');
  const gameModalScreenshots = document.querySelector('#game-modal-screenshots');
  const gameModalVideo = document.querySelector('#game-modal-videos');
  gameModalInfo.innerHTML = "";
  gameModalScreenshots.innerHTML = "";
  gameModalVideo.innerHTML = "";

}

const renderGameInfo = (game, genres, developers, releaseDates, videoID) => {
  renderModal();
  clearGameModal();
  const gameImg = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.png`;
  const gameTitle = game.name;
  const gameRating = game.rating;

  const gameModal = document.querySelector('#game-modal');
  const gamesContainer = document.querySelector('#games');
  gameModal.style.display = "grid";
  gamesContainer.style.display = "none";

  const gameModalImage = document.querySelector('#game-modal-image');
  gameModalImage.src = gameImg;

  const gameModalInfo = document.querySelector('#game-modal-info');
  const gameModalTitle = document.createElement('p');
  gameModalTitle.id = '#game-title';
  gameModalTitle.innerText = gameTitle;
  const gameModalGenres = document.createElement('p');
  gameModalGenres.id = '#game-genres';
  gameModalGenres.innerText = genres.join(", ");
  const gameModalDeveloper = document.createElement('p');
  gameModalDeveloper.id = '#game-developer';
  gameModalDeveloper.innerText = developers.join(", ");
  const gameModalRating = document.createElement('p');
  gameModalRating.id = '#game-rating';
  (gameRating) ? 
  gameModalRating.innerText = Math.round(gameRating * 10) / 10 + " / 100" : 
  gameModalRating.innerText = "Rating not found...";
  const gameModalYearOfRelease = document.createElement('p');
  gameModalYearOfRelease.id = '#game-year-of-release';
  gameModalYearOfRelease.innerText = releaseDates;
  gameModalInfo.append(gameModalTitle, gameModalGenres, gameModalDeveloper, gameModalRating, gameModalYearOfRelease);

  const gameModalScreenshots = document.querySelector('#game-modal-screenshots');
  for (let i = 0; i < 3; i++) {
    const screenShotImgWrapper = document.createElement('a');
    const screenShotImg = document.createElement('img');
    screenShotImg.src = `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${game.screenshots[i].image_id}.png`;
    screenShotImg.classList.add('screen-shot-img');
    screenShotImgWrapper.href = `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${game.screenshots[i].image_id}.png`;
    screenShotImgWrapper.target = "_blank";
    screenShotImgWrapper.appendChild(screenShotImg);
    gameModalScreenshots.appendChild(screenShotImgWrapper);
  }

  const gameVideoTitle = document.createElement('p');
  gameVideoTitle.innerText = 'Video';
  let gameVideo = '';
  if (videoID === 'No video found') {
    gameVideo = document.createElement('p');
    gameVideo.innerText = videoID;
  } else {
    gameVideo = document.createElement('iframe');
    gameVideo.src = `https://www.youtube.com/embed/${videoID}`;
    gameVideo.allowFullscreen = true;
    gameVideo.classList.add('game-video');
  }
  const gameModalVideos = document.querySelector('#game-modal-videos');
  gameModalVideos.appendChild(gameVideoTitle);
  gameModalVideos.appendChild(gameVideo);

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

const renderLoadingScreen = () => {
  const loadingScreen = document.querySelector('#loading');
  loadingScreen.style.display = 'flex';
  const currScreen = document.querySelector('#home');
  currScreen.style.display = 'none';
}

const renderCurrScreen = () => {
  const loadingScreen = document.querySelector('#loading');
  loadingScreen.style.display = 'none';
  const currScreen = document.querySelector('#home');
  currScreen.style.display = 'flex';
}

const renderModal = () => {
  const loadingScreen = document.querySelector('#loading');
  loadingScreen.style.display = 'none';
  const currScreen = document.querySelector('#home');
  currScreen.style.display = 'flex';
  const searchPages = document.querySelector('#search-pages');
  searchPages.style.display = 'none';
}

const closeGameModal = () => {
  const gameModal = document.querySelector('#game-modal');
  const gamesPage = document.querySelector('#games');
  const searchPages = document.querySelector('#search-pages');
  gameModal.style.display = 'none';
  gamesPage.style.display = 'grid';
  searchPages.style.display = 'flex';
}

//EVENT HANDLERS
const handleSearch = (event) => {
  event.preventDefault();
  const formID = event.target.id;
  userInput = event.target[0].value;
  if (!userInput) {
    alert("Please put in a title");
  } else {
    if (formID === 'search') {
      getGames(userInput, 0);
      //getNumOfGames(userInput);
    } else {
      //it's developer
      console.log("hello");
      getDeveloperGames(userInput, 0);
    }
  }
}

const handlePageSearch = (event) => {
  getGames(userInput, event.target.id);
}

const toggleGameInfo = (event) => {
  const gameID = event.target.id;
  getGameInfo(gameID);
}

const toggleSection = (event) => {
  const homeSection = document.querySelector('#home');
  const aboutSection = document.querySelector('#about');
  const contactSection = document.querySelector('#contact');
  const featuresSection = document.querySelector('#features');
  switch (event.target.classList[1]) {
    case 'about-button':
      homeSection.style.display = 'none';
      aboutSection.style.display = 'flex';
      contactSection.style.display = 'none';
      featuresSection.style.display = 'none';
      break;
    case 'contact-button':
      homeSection.style.display = 'none';
      aboutSection.style.display = 'none';
      contactSection.style.display = 'flex';
      featuresSection.style.display = 'none';
      break;
    case 'features-button':
      homeSection.style.display = 'none';
      aboutSection.style.display = 'none';
      contactSection.style.display = 'none';
      featuresSection.style.display = 'flex';
      break;

  }
}

const toggleHome = () => {
  const homeSection = document.querySelector('#home');
  const aboutSection = document.querySelector('#about');
  const contactSection = document.querySelector('#contact');
  const featuresSection = document.querySelector('#features');
  homeSection.style.display = 'flex';
  aboutSection.style.display = 'none';
  contactSection.style.display = 'none';
  featuresSection.style.display = 'none';
}

const toggleForm = (event) => {
  switch (event.target.classList[0]) {
    case 'features-title-link':
      window.location.reload();
      break;
    case 'features-developer-link':
      searchForm.style.display = 'none';
      developerForm.style.display = 'flex';
      toggleHome();
      break;
  }
}

//EVENT LISTENERS AND ONLOAD FUNCTIONS
const backButton = document.querySelector('#back-button');
backButton.addEventListener('click', closeGameModal);
searchForm.addEventListener('submit', handleSearch);
developerForm.addEventListener('submit', handleSearch);
aboutButtons.forEach((aboutButton) => {
  aboutButton.addEventListener('click', toggleSection);
});
contactButtons.forEach((contactButton) => {
  contactButton.addEventListener('click', toggleSection);
});
featuresButton.addEventListener('click', toggleSection);
featuresTitleLinks.forEach((featuresTitleLink) => {
  featuresTitleLink.addEventListener('click', toggleForm);
});
featuresDeveloperLinks.forEach((featuresDeveloperLink) => {
  featuresDeveloperLink.addEventListener('click', toggleForm);
});

getCredentials();