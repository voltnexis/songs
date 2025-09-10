// Album page specific functionality
let currentAlbum = null;

// Get album ID from URL parameters
function getAlbumIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

// Initialize album page
document.addEventListener('DOMContentLoaded', function() {
    const albumId = getAlbumIdFromURL();
    loadAlbumDetails(albumId);
});

// Load album details
function loadAlbumDetails(albumId) {
    currentAlbum = musicDatabase.albums.find(a => a.id === albumId);
    
    if (!currentAlbum) {
        // Create a default album if not found
        currentAlbum = {
            id: albumId,
            title: "Unknown Album",
            artist: "Unknown Artist",
            image: "images/default-album.jpg",
            songs: [],
            year: new Date().getFullYear(),
            genre: "Unknown",
            description: "No description available."
        };
    }
    
    updateAlbumHeader();
    loadAlbumTracks();
    loadMoreAlbums();
}

// Update album header information
function updateAlbumHeader() {
    document.getElementById('albumTitle').textContent = currentAlbum.title;
    document.getElementById('albumArtist').textContent = currentAlbum.artist;
    document.getElementById('albumCover').src = currentAlbum.image;
    document.getElementById('albumCover').onerror = function() {
        this.src = 'images/default-album.jpg';
    };
    
    // Calculate total duration
    const albumSongs = musicDatabase.songs.filter(song => currentAlbum.songs.includes(song.id));
    const totalDuration = calculateTotalDuration(albumSongs);
    
    document.getElementById('albumDetails').textContent = 
        `${currentAlbum.year} • ${currentAlbum.genre || 'Various'} • ${totalDuration}`;
    
    // Update album info section
    document.getElementById('albumDescription').textContent = 
        currentAlbum.description || "No description available for this album.";
    document.getElementById('releaseDate').textContent = currentAlbum.year;
    document.getElementById('totalTracks').textContent = currentAlbum.songs.length;
    document.getElementById('albumDuration').textContent = totalDuration;
    document.getElementById('albumGenre').textContent = currentAlbum.genre || 'Various';
    document.getElementById('moreByArtist').textContent = currentAlbum.artist;
}

// Calculate total duration of album
function calculateTotalDuration(songs) {
    let totalSeconds = 0;
    
    songs.forEach(song => {
        if (song.duration) {
            const parts = song.duration.split(':');
            totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Load album tracks
function loadAlbumTracks() {
    const tracksContainer = document.getElementById('albumTracks');
    const albumSongs = musicDatabase.songs.filter(song => currentAlbum.songs.includes(song.id));
    
    tracksContainer.innerHTML = '';
    
    if (albumSongs.length === 0) {
        tracksContainer.innerHTML = '<p>No tracks available for this album.</p>';
        return;
    }
    
    albumSongs.forEach((song, index) => {
        const trackItem = createTrackItem(song, index + 1);
        tracksContainer.appendChild(trackItem);
    });
}

// Create track item
function createTrackItem(song, trackNumber) {
    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `
        <div class="track-number">${trackNumber}</div>
        <div class="track-info">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
        <div class="track-duration">${song.duration}</div>
        <div class="track-actions">
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
    
    // Add click to play functionality
    item.addEventListener('click', function(e) {
        if (!e.target.closest('.track-actions')) {
            playSong(song.id);
        }
    });
    
    return item;
}

// Load more albums by the same artist
function loadMoreAlbums() {
    const moreAlbumsContainer = document.getElementById('moreAlbums');
    const moreAlbums = musicDatabase.albums
        .filter(album => album.artist === currentAlbum.artist && album.id !== currentAlbum.id)
        .slice(0, 6);
    
    moreAlbumsContainer.innerHTML = '';
    
    if (moreAlbums.length === 0) {
        moreAlbumsContainer.innerHTML = '<p>No other albums by this artist.</p>';
        return;
    }
    
    moreAlbums.forEach(album => {
        const albumCard = createMoreAlbumCard(album);
        moreAlbumsContainer.appendChild(albumCard);
    });
}

// Create more album card
function createMoreAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => window.location.href = `album.html?id=${album.id}`;
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

// Play entire album
function playAlbum() {
    const albumSongs = musicDatabase.songs.filter(song => currentAlbum.songs.includes(song.id));
    
    if (albumSongs.length === 0) {
        alert('No songs available to play.');
        return;
    }
    
    currentPlaylist = albumSongs.map(song => song.id);
    currentIndex = 0;
    playSong(currentPlaylist[0]);
}

// Download entire album
function downloadAlbum() {
    const albumSongs = musicDatabase.songs.filter(song => currentAlbum.songs.includes(song.id));
    
    if (albumSongs.length === 0) {
        alert('No songs available to download.');
        return;
    }
    
    if (confirm(`Download all ${albumSongs.length} songs from "${currentAlbum.title}"?`)) {
        albumSongs.forEach((song, index) => {
            setTimeout(() => downloadSong(song.id), index * 100);
        });
    }
}

// Add album to library
function addAlbumToLibrary() {
    const addBtn = event.target.closest('button');
    const isAdded = addBtn.classList.contains('added');
    
    if (isAdded) {
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Library';
        addBtn.classList.remove('added');
        alert(`"${currentAlbum.title}" removed from your library.`);
    } else {
        addBtn.innerHTML = '<i class="fas fa-check"></i> In Library';
        addBtn.classList.add('added');
        alert(`"${currentAlbum.title}" added to your library!`);
    }
}

// Add song to playlist
function addToPlaylist(songId) {
    const song = musicDatabase.songs.find(s => s.id === songId);
    if (!song) return;
    
    alert(`"${song.title}" added to your playlist!`);
}

// Add CSS for album page specific styles
const albumPageStyles = `
    .album-header {
        background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('../images/album-bg.jpg');
        background-size: cover;
        background-position: center;
        padding: 4rem 2rem;
    }
    
    .album-banner {
        display: flex;
        align-items: center;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .album-banner img {
        width: 250px;
        height: 250px;
        border-radius: 15px;
        object-fit: cover;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    
    .album-info h1 {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        color: #ff6b6b;
    }
    
    .album-info p {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        opacity: 0.8;
    }
    
    .album-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 2rem;
    }
    
    .track-list {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 1rem;
        margin-top: 2rem;
    }
    
    .track-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .track-item:hover {
        background: rgba(255, 107, 107, 0.1);
    }
    
    .track-item:last-child {
        border-bottom: none;
    }
    
    .track-number {
        font-size: 1.2rem;
        font-weight: bold;
        margin-right: 1rem;
        color: #ff6b6b;
        min-width: 30px;
        text-align: center;
    }
    
    .track-info {
        flex: 1;
    }
    
    .track-info h4 {
        margin-bottom: 0.25rem;
        color: #fff;
    }
    
    .track-info p {
        opacity: 0.7;
        font-size: 0.9rem;
    }
    
    .track-duration {
        margin-right: 1rem;
        opacity: 0.7;
        font-family: monospace;
    }
    
    .track-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .album-description {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 2rem;
        margin-top: 2rem;
    }
    
    .album-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }
    
    .stat-item i {
        font-size: 2rem;
        color: #ff6b6b;
        margin-bottom: 0.5rem;
    }
    
    .stat-item span {
        opacity: 0.7;
        margin-bottom: 0.5rem;
    }
    
    .stat-item strong {
        color: #ff6b6b;
        font-size: 1.2rem;
    }
    
    .added {
        background: #4ecdc4 !important;
    }
    
    @media (max-width: 768px) {
        .album-banner {
            flex-direction: column;
            text-align: center;
        }
        
        .album-banner img {
            width: 200px;
            height: 200px;
        }
        
        .album-info h1 {
            font-size: 2rem;
        }
        
        .album-actions {
            justify-content: center;
        }
        
        .track-item {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .track-actions {
            order: 1;
            width: 100%;
            justify-content: center;
        }
        
        .album-stats {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;

// Add the styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = albumPageStyles;
document.head.appendChild(styleSheet);