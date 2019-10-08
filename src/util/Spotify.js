let UserAccessToken = '';
const ClientID = '<Fill_me_in>';
const redirectURI = "https://jamper.surge.sh";
let count = 0;
const Spotify = {
  getAccessToken: function() {
    if (String(UserAccessToken).length > 0) {
      return UserAccessToken;
    } else {
      const at_match = window.location.href.match(/access_token=([^&]*)/);
      const exp_match = window.location.href.match(/expires_in=([^&]*)/);
      if (at_match && at_match[1] && exp_match[1]) {
        count = count + 1;
        UserAccessToken = at_match[1];
        window.setTimeout(() => {
          UserAccessToken = '';
        }, parseInt(exp_match[1]) * 1000);
        window.history.pushState('Access Token', null, '/');
        return Spotify.getAccessToken();
      } else {
        window.location = `https://accounts.spotify.com/authorize?client_id=${ClientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      }
    }
  },
  savePlaylist: async function(name = '', trackURIs = []) {
    if (!name || trackURIs.length === 0) {
      return;
    }
    const token = Spotify.getAccessToken();
    const headers = { headers: {  'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
    let response;
    let data;
    let userID;
    try {
      response = await fetch('https://api.spotify.com/v1/me', headers);
      if (response.ok) {
        data = await response.json();
        userID = data.id;
        response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: 'POST',
          headers: headers.headers,
          body: JSON.stringify({ 'name': name })
        });
        if (response.ok) {
          data = await response.json();
          if (data.id) {
            response = await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
              method: 'PUT',
              headers: headers.headers,
              body: JSON.stringify({uris: trackURIs})
            });
            if (response.ok) {
              console.log("Yay!");
            }
            console.log(response);
          }
        } else {
          console.log(response);
          throw new Error('Reponse not ok!');
        }
      } else {
        console.log(response);
        throw new Error('Reponse not ok!');
      }
    } catch(error) {
      console.log(error);
    }
  },
  search: async function(term) {
    let data = Spotify.fetch(term);
    return data.then(tracks => {
      const searchResults = tracks.tracks.items.map(track => {
        const song = {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        };
        return song;
      });
      return searchResults;
    });
  },
  fetch: async function(term) {
    let response;
    let data;
    try {
      response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
        { headers: {  'Authorization': `Bearer ${Spotify.getAccessToken()}` } });
      if (response.ok) {
        data = await response.json();
        return data;
      } else {
        console.log(response);
        throw new Error('Reponse not ok!');
      }
    } catch(error) {
      console.log(error);
    }
  }
};
export default Spotify;
