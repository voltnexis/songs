// Artist page specific functionality
let currentArtist = null;

// Get artist ID from URL parameters
function getArtistIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

// Initialize artist page
document.addEventListener('DOMContentLoaded', function() {
    const artistId = getArtistIdFromURL();
    loadArtistProfile(artistId);
});

// Load artist profile
function loadArtistProfile(artistId) {
    currentArtist = musicDatabase.artists.find(a => a.id === artistId);
    
    if (!currentArtist) {
        // Create a default artist if not found
        currentArtist = {
            id: artistId,
            name: "Unknown Artist",
            image: "images/default-artist.jpg",
            songs: [],
            albums: [],
            followers: 0,
            bio: "No information available."
        };
    }
    
    updateArtistHeader();
    loadPopularSongs();
    loadArtistAlbums();
    loadAllSongs();
    loadSimilarArtists();
}

// Update artist header information
function updateArtistHeader() {
    document.getElementById('artistName').textContent = currentArtist.name;
    document.getElementById('artistImage').src = currentArtist.image;
    document.getElementById('artistImage').onerror = function() {
        this.src = 'images/default-artist.jpg';
    };
    
    const songCount = currentArtist.songs.length;
    const albumCount = currentArtist.albums.length;
    const followers = currentArtist.followers || 0;
    
    document.getElementById('artistStats').textContent = 
        `${songCount} songs • ${albumCount} albums • ${followers.toLocaleString()} followers`;
}

// Load popular songs by the artist
function loadPopularSongs() {
    const popularSongsContainer = document.getElementById('popularSongs');
    const artistSongs = musicDatabase.songs
        .filter(song => currentArtist.songs.includes(song.id))
        .sort((a, b) => (b.plays || 0) - (a.plays || 0))
        .slice(0, 5);
    
    popularSongsContainer.innerHTML = '';
    
    if (artistSongs.length === 0) {
        popularSongsContainer.innerHTML = '<p>No songs available for this artist.</p>';
        return;
    }
    
    artistSongs.forEach((song, index) => {
        const songItem = createArtistSongItem(song, index + 1);
        popularSongsContainer.appendChild(songItem);
    });
}

// Load artist albums
function loadArtistAlbums() {
    const albumsContainer = document.getElementById('artistAlbums');
    const artistAlbums = musicDatabase.albums.filter(album => 
        currentArtist.albums.includes(album.title) || album.artist === currentArtist.name
    );
    
    albumsContainer.innerHTML = '';
    
    if (artistAlbums.length === 0) {
        albumsContainer.innerHTML = '<p>No albums available for this artist.</p>';
        return;
    }
    
    artistAlbums.forEach(album => {
        const albumCard = createArtistAlbumCard(album);
        albumsContainer.appendChild(albumCard);
    });
}

// Load all songs by the artist
function loadAllSongs() {
    const allSongsContainer = document.getElementById('allSongs');
    const artistSongs = musicDatabase.songs.filter(song => 
        currentArtist.songs.includes(song.id) || song.artist === currentArtist.name
    );
    
    allSongsContainer.innerHTML = '';
    
    if (artistSongs.length === 0) {
        allSongsContainer.innerHTML = '<p>No songs available for this artist.</p>';
        return;
    }
    
    artistSongs.forEach((song, index) => {
        const songItem = createArtistSongItem(song, index + 1);
        allSongsContainer.appendChild(songItem);
    });
}

// Load similar artists
function loadSimilarArtists() {
    const similarArtistsContainer = document.getElementById('similarArtists');
    const similarArtists = musicDatabase.artists
        .filter(artist => artist.id !== currentArtist.id)
        .slice(0, 6);
    
    similarArtistsContainer.innerHTML = '';
    
    similarArtists.forEach(artist => {
        const artistCard = createSimilarArtistCard(artist);
        similarArtistsContainer.appendChild(artistCard);
    });
}

// Create artist song item
function createArtistSongItem(song, number) {
    const item = document.createElement('div');
    item.className = 'song-item';
    item.innerHTML = `
        <span class="song-number">${number}</span>
        <img src="${song.image}" alt="${song.title}" onerror="this.src='images/default-song.jpg'">
        <div class="song-item-info">
            <h5>${song.title}</h5>
            <p>${song.artist} • ${song.album}</p>
            <p class="song-plays">${(song.plays || 0).toLocaleString()} plays</p>
        </div>
        <div class="song-duration">
            <span>${song.duration}</span>
        </div>
        <div class="song-item-actions">
            <button class="btn btn-play" onclick="playSong(${song.id})" title="Play">
                <i class="fas fa-play"></i>
            </button>
            <button class="btn btn-download" onclick="downloadSong(${song.id})" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn" onclick="addToPlaylist(${song.id})" title="Add to Playlist">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    return item;
}

// Create artist album card
function createArtistAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => showAlbumPage(album.id);
    card.innerHTML = `
        <img src="${album.image}" alt="${album.title}" onerror="this.src='images/default-album.jpg'">
        <div class="album-info">
            <h4>${album.title}</h4>
            <p>${album.year}</p>
            <p>${album.songs.length} songs</p>
        </div>
    `;
    return card;
}

// Create similar artist card
function createSimilarArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.onclick = () => window.location.href = `artist.html?id=${artist.id}`;
    card.innerHTML = `
        <img src="${artist.image}" alt="${artist.name}" onerror="this.src='images/default-artist.jpg'">
        <h4>${artist.name}</h4>
        <p>${artist.songs.length} songs</p>
    `;
    return card;
}

// Play all songs by the artist
function playAllSongs() {
    const artistSongs = musicDatabase.songs.filter(song => 
        currentArtist.songs.includes(song.id) || song.artist === currentArtist.name
    );
    
    if (artistSongs.length === 0) {
        alert('No songs available to play.');
        return;
    }
    
    currentPlaylist = artistSongs.map(song => song.id);
    currentIndex = 0;
    playSong(currentPlaylist[0]);
}

// Download all songs by the artist
function downloadAllSongs() {
    const artistSongs = musicDatabase.songs.filter(song => 
        currentArtist.songs.includes(song.id) || song.artist === currentArtist.name
    );
    
    if (artistSongs.length === 0) {
        alert('No songs available to download.');
        return;
    }
    
    if (confirm(`Download all ${artistSongs.length} songs by ${currentArtist.name}?`)) {
        artistSongs.forEach(song => {
            setTimeout(() => downloadSong(song.id), 100);
        });
    }
}

// Follow/Unfollow artist
function followArtist() {
    const followBtn = event.target.closest('button');
    const isFollowing = followBtn.classList.contains('following');
    
    if (isFollowing) {
        followBtn.innerHTML = '<i class="fas fa-heart"></i> Follow';
        followBtn.classList.remove('following');
        currentArtist.followers = Math.max(0, (currentArtist.followers || 0) - 1);
    } else {
        followBtn.innerHTML = '<i class="fas fa-heart-broken"></i> Following';
        followBtn.classList.add('following');
        currentArtist.followers = (currentArtist.followers || 0) + 1;
    }
    
    updateArtistHeader();
}

// Add song to playlist
function addToPlaylist(songId) {
    const song = musicDatabase.songs.find(s => s.id === songId);
    if (!song) return;
    
    // For now, just show a confirmation
    alert(`"${song.title}" added to your playlist!`);
    
    // In a real implementation, you would save this to user's playlists
}

// Add CSS for artist page specific styles
const artistPageStyles = `
    .artist-profile-header {
        background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('../images/artist-bg.jpg');
        background-size: cover;
        background-position: center;
        padding: 4rem 2rem;
    }
    
    .artist-banner {
        display: flex;
        align-items: center;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .artist-banner img {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #ff6b6b;
    }
    
    .artist-info h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ff6b6b;
    }
    
    .artist-info p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.8;
    }
    
    .artist-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .song-plays {
        font-size: 0.8rem;
        opacity: 0.6;
    }
    
    .song-duration {
        margin-right: 1rem;
        opacity: 0.7;
    }
    
    .following {
        background: #4ecdc4 !important;
    }
    
    @media (max-width: 768px) {
        .artist-banner {
            flex-direction: column;
            text-align: center;
        }
        
        .artist-banner img {
            width: 150px;
            height: 150px;
        }
        
        .artist-info h1 {
            font-size: 2rem;
        }
        
        .artist-actions {
            justify-content: center;
        }
    }
`;

// Add the styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = artistPageStyles;
document.head.appendChild(styleSheet);