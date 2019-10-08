import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    };
    Spotify.getAccessToken();
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }
  search(term = '') {
    if (String(term).length === 0) {
      return;
    }
    const promise = Spotify.search(term);
    promise.then((tracks) => {
      this.setState({ searchResults: tracks });
    });
  }
  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => { return track.uri });
    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({playlistName: 'New Playlist', playlistTracks: []});
  }
  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }
  addTrack(track){
    const playlist = this.state.playlistTracks;
    if ( playlist.some(thatTrack => { return thatTrack.id === track.id }) ) {

    } else {
      playlist.push(track)
      this.setState({ playlistTracks: playlist });
    }
  }
  removeTrack(track){
    const playlist = this.state.playlistTracks.filter(thatTrack => { return thatTrack.id !== track.id });
    this.setState({ playlistTracks: playlist });
  }
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
