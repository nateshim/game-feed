const igdbUrl = 'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4'; 
const clientID = '03ktyk7tynafougy2affcczbqjhoi7';
const clientSecret = 'quuj42etoeh1fstmfiv9wpvhv9yq3p';

const getCredentials = async () => {
  const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`);
  const token = response.data.access_token;
  //SETTING UP DEFAULT HEADERS FOR AUTHORIZATION
  axios.defaults.headers.common['Client-ID'] = clientID;
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  console.log(token);
  
  //getTenRandomGames(token);
  getGenres();

} 

const getGenres = async (token) => {
  const response = await axios.get(`${igdbUrl}/genres`, {
    params: {
      fields: "name",
      limit: 23,
    }
  });
  console.log(response);
}

const getTenRandomGames = async (token) => {
  const response = await axios.get(`${igdbUrl}/games`, {
    params: {
      fields: "name",
      limit: 10
    }
  });
  console.log(response);
}

getCredentials();