// Enhanced song database
const songDatabase = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        category: "pop",
        file: "songs/1.mp3",
        duration: "3:20",
        image: "images/1.jpg",
        year: 2020,
        plays: 2500000000,
        description: "A synth-pop masterpiece that dominated charts worldwide"
    },
    {
        id: 2,
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        category: "rock",
        file: "songs/bohemian-rhapsody.mp3",
        duration: "5:55",
        image: "images/night-opera.jpg",
        year: 1975,
        plays: 1800000000,
        description: "An epic rock opera that redefined music"
    }
];

// Local storage functions
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key, defaultValue = []) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

// Load playlists from local storage
let playlists = loadFromStorage('vnSongs_playlists', [
    {
        id: 1,
        name: "Liked Songs",
        songs: [],
        image: "images/liked.jpg"
    }
]);

// Load liked songs from local storage
let likedSongs = loadFromStorage('vnSongs_likedSongs', []);

// Global variables
let allSongs = [...songDatabase];
let currentSong = null;
let isPlaying = false;
let audio = null;
let currentSection = 'home';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    audio = document.getElementById('audio');
    setupEventListeners();
    setupAudioEvents();
    loadHomeContent();
    updateGreeting();
    updatePlaylistSidebar();
});

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Player controls
    document.getElementById('progressSlider').addEventListener('input', seek);
    document.getElementById('mobileProgressSlider').addEventListener('input', seek);
    document.getElementById('fullscreenProgressSlider').addEventListener('input', seek);
    document.getElementById('volumeSlider').addEventListener('input', changeVolume);
}

// Setup audio events
function setupAudioEvents() {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', updateDuration);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Switch sections
function switchSection(section) {
    // Update nav
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItems = document.querySelectorAll(`[onclick*="${section}"]`);
    navItems.forEach(item => item.classList.add('active'));
    
    // Update content
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
    
    currentSection = section;
    
    // Close mobile menu
    document.getElementById('mobileMenu').style.display = 'none';
    
    // Load section content
    if (section === 'home') loadHomeContent();
    if (section === 'search') loadSearchContent();
    if (section === 'library') loadLibraryContent();
}

// Update greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    
    document.getElementById('greeting').textContent = greeting;
}

// Load home content
function loadHomeContent() {
    loadSongsList();
}

// Load songs list
function loadSongsList() {
    const container = document.getElementById('songsList');
    container.innerHTML = '';
    
    if (allSongs.length === 0) {
        container.innerHTML = `
            <div class="no-search">
                <i class="fas fa-music"></i>
                <h2>No songs found</h2>
                <p>Add songs to the songDatabase array in script.js</p>
            </div>
        `;
        return;
    }
    
    allSongs.forEach(song => {
        const songItem = createSongItem(song);
        container.appendChild(songItem);
    });
}

// Create song item
function createSongItem(song) {
    const item = document.createElement('div');
    item.className = 'song-item';
    
    const isCurrentSong = currentSong && currentSong.id === song.id;
    const playIcon = isCurrentSong && isPlaying ? 'fas fa-pause' : 'fas fa-play';
    
    item.innerHTML = `
        <div class="song-image" onclick="showSongDetail(${song.id})">
            ${song.image ? `<img src="${song.image}" alt="${song.title}" onerror="this.parentElement.querySelector('i').style.display='flex'">` : '<i class="fas fa-music"></i>'}
        </div>
        <div class="song-info" onclick="showSongDetail(${song.id})">
            <div class="song-title">${song.title}</div>
            <div class="song-artist" onclick="event.stopPropagation(); showArtistDetail('${song.artist}')">${song.artist}</div>
        </div>
        <div class="song-duration">${song.duration}</div>
        <div class="song-actions">
            <button class="action-btn play-btn-${song.id}" onclick="playSong(${song.id})" title="${isCurrentSong && isPlaying ? 'Pause' : 'Play'}">
                <i class="${playIcon}"></i>
            </button>
            <button class="action-btn" onclick="downloadSong(${song.id})" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn" onclick="addToPlaylist(${song.id})" title="Add to Playlist">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    return item;
}

// Show song detail
function showSongDetail(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    const container = document.getElementById('songDetail');
    container.innerHTML = `
        <button onclick="goBack()" style="background:none;border:none;color:#b3b3b3;font-size:24px;margin-bottom:20px;cursor:pointer;">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="detail-header">
            <img src="${song.image || 'images/default.jpg'}" alt="${song.title}" class="detail-image" onerror="this.src='images/default.jpg'">
            <div class="detail-info">
                <p>SONG</p>
                <h1>${song.title}</h1>
                <div class="detail-meta">
                    <span onclick="showArtistDetail('${song.artist}')" style="cursor:pointer;text-decoration:underline;">${song.artist}</span>
                    <span>•</span>
                    <span onclick="showAlbumDetail('${song.album}')" style="cursor:pointer;text-decoration:underline;">${song.album}</span>
                    <span>•</span>
                    <span>${song.year}</span>
                    <span>•</span>
                    <span>${song.duration}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="play-btn-large" onclick="playSong(${song.id})">
                <i class="fas fa-play"></i>
            </button>
            <button class="action-btn like-btn-${song.id}" onclick="toggleLike(${song.id})" style="color: ${likedSongs.includes(song.id) ? '#1db954' : '#b3b3b3'}">
                <i class="${likedSongs.includes(song.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="action-btn" onclick="addToPlaylist(${song.id})">
                <i class="fas fa-plus"></i>
            </button>
            <button class="action-btn" onclick="downloadSong(${song.id})">
                <i class="fas fa-download"></i>
            </button>
        </div>
        
        <div style="margin-top:32px;">
            <h3>About this song</h3>
            <p style="color:#b3b3b3;margin-top:16px;">${song.description}</p>
        </div>
    `;
    
    switchSection('songDetail');
}

// Show artist detail
function showArtistDetail(artistName) {
    const artistSongs = allSongs.filter(song => song.artist === artistName);
    if (artistSongs.length === 0) return;
    
    const container = document.getElementById('artistDetail');
    container.innerHTML = `
        <button onclick="goBack()" style="background:none;border:none;color:#b3b3b3;font-size:24px;margin-bottom:20px;cursor:pointer;">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="detail-header">
            <img src="images/artists/${artistName.toLowerCase().replace(/\s+/g, '-')}.jpg" alt="${artistName}" class="detail-image" style="border-radius:50%;" onerror="this.src='images/default-artist.jpg'">
            <div class="detail-info">
                <p>ARTIST</p>
                <h1>${artistName}</h1>
                <div class="detail-meta">
                    <span>${artistSongs.length} songs</span>
                </div>
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="play-btn-large" onclick="playArtist('${artistName}')">
                <i class="fas fa-play"></i>
            </button>
        </div>
        
        <div style="margin-top:32px;">
            <h3>Popular</h3>
            <div class="songs-list" style="margin-top:16px;">
                ${artistSongs.map(song => `
                    <div class="song-item">
                        <div class="song-image" onclick="showSongDetail(${song.id})">
                            ${song.image ? `<img src="${song.image}" alt="${song.title}" onerror="this.style.display='none'">` : ''}
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="song-info" onclick="showSongDetail(${song.id})">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.plays ? song.plays.toLocaleString() + ' plays' : 'Unknown plays'}</div>
                        </div>
                        <div class="song-duration">${song.duration}</div>
                        <div class="song-actions">
                            <button class="action-btn" onclick="playSong(${song.id})">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="action-btn" onclick="downloadSong(${song.id})">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    switchSection('artistDetail');
}

// Show album detail
function showAlbumDetail(albumName) {
    const albumSongs = allSongs.filter(song => song.album === albumName);
    if (albumSongs.length === 0) return;
    
    const container = document.getElementById('albumDetail');
    container.innerHTML = `
        <button onclick="goBack()" style="background:none;border:none;color:#b3b3b3;font-size:24px;margin-bottom:20px;cursor:pointer;">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="detail-header">
            <img src="${albumSongs[0].image || 'images/default.jpg'}" alt="${albumName}" class="detail-image" onerror="this.src='images/default.jpg'">
            <div class="detail-info">
                <p>ALBUM</p>
                <h1>${albumName}</h1>
                <div class="detail-meta">
                    <span onclick="showArtistDetail('${albumSongs[0].artist}')" style="cursor:pointer;text-decoration:underline;">${albumSongs[0].artist}</span>
                    <span>•</span>
                    <span>${albumSongs[0].year}</span>
                    <span>•</span>
                    <span>${albumSongs.length} songs</span>
                </div>
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="play-btn-large" onclick="playAlbum('${albumName}')">
                <i class="fas fa-play"></i>
            </button>
        </div>
        
        <div style="margin-top:32px;">
            <div class="songs-list">
                ${albumSongs.map((song, index) => `
                    <div class="song-item">
                        <div style="width:40px;text-align:center;color:#b3b3b3;">${index + 1}</div>
                        <div class="song-info" onclick="showSongDetail(${song.id})" style="margin-left:12px;">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <div class="song-duration">${song.duration}</div>
                        <div class="song-actions">
                            <button class="action-btn" onclick="playSong(${song.id})">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="action-btn" onclick="downloadSong(${song.id})">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    switchSection('albumDetail');
}

// Load search content
function loadSearchContent() {
    const container = document.getElementById('searchResults');
    container.innerHTML = `
        <div class="no-search">
            <i class="fas fa-search"></i>
            <h2>Search for music</h2>
            <p>Find songs, artists, and albums</p>
        </div>
    `;
}

// Handle search
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        loadSearchContent();
        return;
    }
    
    const results = allSongs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );
    
    displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(songs, query) {
    const container = document.getElementById('searchResults');
    
    if (songs.length === 0) {
        container.innerHTML = `
            <div class="no-search">
                <i class="fas fa-search"></i>
                <h2>No results found for "${query}"</h2>
                <p>Try searching for something else</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 style="margin-bottom:20px;">Results for "${query}"</h2>
        <div class="songs-list">
            ${songs.map(song => {
                const isCurrentSong = currentSong && currentSong.id === song.id;
                const playIcon = isCurrentSong && isPlaying ? 'fas fa-pause' : 'fas fa-play';
                return `
                    <div class="song-item">
                        <div class="song-image" onclick="showSongDetail(${song.id})">
                            ${song.image ? `<img src="${song.image}" alt="${song.title}" onerror="this.parentElement.querySelector('i').style.display='flex'">` : '<i class="fas fa-music"></i>'}
                        </div>
                        <div class="song-info" onclick="showSongDetail(${song.id})">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist" onclick="event.stopPropagation(); showArtistDetail('${song.artist}')">${song.artist}</div>
                        </div>
                        <div class="song-duration">${song.duration}</div>
                        <div class="song-actions">
                            <button class="action-btn play-btn-${song.id}" onclick="playSong(${song.id})">
                                <i class="${playIcon}"></i>
                            </button>
                            <button class="action-btn" onclick="downloadSong(${song.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn" onclick="addToPlaylist(${song.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Load library content
function loadLibraryContent() {
    const container = document.getElementById('libraryContent');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1>Your Library</h1>
            <button class="action-btn" onclick="createPlaylist()" title="Create Playlist">
                <i class="fas fa-plus"></i>
            </button>
        </div>
        
        <div>
            <h3>Playlists</h3>
            <div style="margin-top:16px;">
                ${playlists.map(playlist => `
                    <div class="song-item" onclick="showPlaylist(${playlist.id})">
                        <div class="song-image">
                            <i class="fas fa-${playlist.name === 'Liked Songs' ? 'heart' : 'music'}"></i>
                        </div>
                        <div class="song-info">
                            <div class="song-title">${playlist.name}</div>
                            <div class="song-artist">${playlist.songs.length} songs</div>
                        </div>
                        ${playlist.name !== 'Liked Songs' ? `
                            <div class="song-actions">
                                <button class="action-btn" onclick="event.stopPropagation(); renamePlaylist(${playlist.id})" title="Rename">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Create playlist
function createPlaylist() {
    const name = prompt('Enter playlist name:');
    if (!name || name.trim() === '') return;
    
    const newPlaylist = {
        id: Date.now(), // Use timestamp as unique ID
        name: name.trim(),
        songs: [],
        image: "images/playlist.jpg",
        created: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    saveToStorage('vnSongs_playlists', playlists);
    
    // Update playlist list in sidebar
    updatePlaylistSidebar();
    
    // Refresh library if currently viewing
    if (currentSection === 'library') {
        loadLibraryContent();
    }
}

// Update playlist sidebar
function updatePlaylistSidebar() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = `
        <div class="playlist-item" onclick="createPlaylist()">
            <i class="fas fa-plus"></i>
            <span>Create Playlist</span>
        </div>
        ${playlists.map(playlist => `
            <div class="playlist-item" onclick="showPlaylist(${playlist.id})">
                <i class="fas fa-${playlist.name === 'Liked Songs' ? 'heart' : 'music'}"></i>
                <span>${playlist.name}</span>
            </div>
        `).join('')}
    `;
}

// Add song to playlist
function addToPlaylist(songId) {
    const availablePlaylists = playlists.filter(p => p.name !== 'Liked Songs');
    
    if (availablePlaylists.length === 0) {
        const createNew = confirm('No playlists found. Create a new playlist?');
        if (createNew) {
            const name = prompt('Enter playlist name:');
            if (name && name.trim()) {
                createPlaylistAndAdd(name.trim(), songId);
            }
        }
        return;
    }
    
    const playlistOptions = availablePlaylists
        .map((p, index) => `${index + 1}. ${p.name}`)
        .join('\n');
    
    const selection = prompt(`Add to playlist:\n${playlistOptions}\n\nEnter number (or 0 to create new):`);
    if (!selection) return;
    
    const choice = parseInt(selection);
    
    if (choice === 0) {
        const name = prompt('Enter new playlist name:');
        if (name && name.trim()) {
            createPlaylistAndAdd(name.trim(), songId);
        }
        return;
    }
    
    const playlist = availablePlaylists[choice - 1];
    if (!playlist) {
        alert('Invalid selection!');
        return;
    }
    
    if (playlist.songs.includes(songId)) {
        alert('Song already in playlist!');
        return;
    }
    
    playlist.songs.push(songId);
    saveToStorage('vnSongs_playlists', playlists);
    alert(`Added to ${playlist.name}!`);
}

// Create playlist and add song
function createPlaylistAndAdd(name, songId) {
    const newPlaylist = {
        id: Date.now(),
        name: name,
        songs: [songId],
        image: "images/playlist.jpg",
        created: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    saveToStorage('vnSongs_playlists', playlists);
    updatePlaylistSidebar();
    
    alert(`Created "${name}" and added song!`);
    
    if (currentSection === 'library') {
        loadLibraryContent();
    }
}

// Rename playlist
function renamePlaylist(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.name === 'Liked Songs') return;
    
    const newName = prompt('Enter new playlist name:', playlist.name);
    if (!newName || newName.trim() === '' || newName.trim() === playlist.name) return;
    
    playlist.name = newName.trim();
    saveToStorage('vnSongs_playlists', playlists);
    updatePlaylistSidebar();
    loadLibraryContent();
}

// Show playlist
function showPlaylist(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    const playlistSongs = allSongs.filter(song => playlist.songs.includes(song.id));
    
    const container = document.getElementById('libraryContent');
    container.innerHTML = `
        <button onclick="loadLibraryContent()" style="background:none;border:none;color:#b3b3b3;font-size:24px;margin-bottom:20px;cursor:pointer;">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="detail-header">
            <div class="detail-image" style="background: linear-gradient(45deg, #1db954, #1ed760); display: flex; align-items: center; justify-content: center; font-size: 48px; color: #000;">
                <i class="fas fa-${playlist.name === 'Liked Songs' ? 'heart' : 'music'}"></i>
            </div>
            <div class="detail-info">
                <p>PLAYLIST</p>
                <h1>${playlist.name}</h1>
                <div class="detail-meta">
                    <span>${playlist.songs.length} songs</span>
                </div>
            </div>
        </div>
        
        ${playlist.songs.length > 0 ? `
            <div class="detail-actions">
                <button class="play-btn-large" onclick="playPlaylist(${playlist.id})">
                    <i class="fas fa-play"></i>
                </button>
                ${playlist.name !== 'Liked Songs' ? `
                    <button class="action-btn" onclick="deletePlaylist(${playlist.id})" style="color: #ff4444;">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            
            <div style="margin-top:32px;">
                <div class="songs-list">
                    ${playlistSongs.map((song, index) => `
                        <div class="song-item">
                            <div style="width:40px;text-align:center;color:#b3b3b3;">${index + 1}</div>
                            <div class="song-image" onclick="showSongDetail(${song.id})">
                                ${song.image ? `<img src="${song.image}" alt="${song.title}" onerror="this.parentElement.querySelector('i').style.display='flex'">` : '<i class="fas fa-music"></i>'}
                            </div>
                            <div class="song-info" onclick="showSongDetail(${song.id})">
                                <div class="song-title">${song.title}</div>
                                <div class="song-artist" onclick="event.stopPropagation(); showArtistDetail('${song.artist}')">${song.artist}</div>
                            </div>
                            <div class="song-duration">${song.duration}</div>
                            <div class="song-actions">
                                <button class="action-btn play-btn-${song.id}" onclick="playSong(${song.id})">
                                    <i class="${currentSong && currentSong.id === song.id && isPlaying ? 'fas fa-pause' : 'fas fa-play'}"></i>
                                </button>
                                <button class="action-btn" onclick="removeFromPlaylist(${playlist.id}, ${song.id})" style="color: #ff4444;">
                                    <i class="fas fa-minus"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div style="text-align: center; padding: 50px; color: #b3b3b3;">
                <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px;"></i>
                <h3>No songs in this playlist</h3>
                <p>Add some songs to get started!</p>
            </div>
        `}
    `;
}

// Play playlist
function playPlaylist(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;
    
    playSong(playlist.songs[0]);
}

// Remove from playlist
function removeFromPlaylist(playlistId, songId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    const songIndex = playlist.songs.indexOf(songId);
    if (songIndex > -1) {
        playlist.songs.splice(songIndex, 1);
        saveToStorage('vnSongs_playlists', playlists);
        
        // If it's liked songs, also remove from likedSongs array
        if (playlist.name === 'Liked Songs') {
            const likedIndex = likedSongs.indexOf(songId);
            if (likedIndex > -1) {
                likedSongs.splice(likedIndex, 1);
                saveToStorage('vnSongs_likedSongs', likedSongs);
            }
        }
        
        // Refresh playlist view
        showPlaylist(playlistId);
    }
}

// Delete playlist
function deletePlaylist(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.name === 'Liked Songs') return;
    
    if (confirm(`Delete playlist "${playlist.name}"?`)) {
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        if (playlistIndex > -1) {
            playlists.splice(playlistIndex, 1);
            saveToStorage('vnSongs_playlists', playlists);
            updatePlaylistSidebar();
            loadLibraryContent();
        }
    }
}

// Play song
function playSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    // If clicking on the same song that's currently playing, toggle play/pause
    if (currentSong && currentSong.id === songId && isPlaying) {
        togglePlay();
        return;
    }
    
    currentSong = song;
    updateNowPlaying(song);
    
    audio.src = song.file;
    audio.load();
    
    audio.play().then(() => {
        isPlaying = true;
        updatePlayButton();
    }).catch(error => {
        console.error('Audio error:', error);
        isPlaying = true;
        updatePlayButton();
    });
}

// Play artist
function playArtist(artistName) {
    const artistSongs = allSongs.filter(song => song.artist === artistName);
    if (artistSongs.length > 0) {
        playSong(artistSongs[0].id);
    }
}

// Play album
function playAlbum(albumName) {
    const albumSongs = allSongs.filter(song => song.album === albumName);
    if (albumSongs.length > 0) {
        playSong(albumSongs[0].id);
    }
}

// Update now playing
function updateNowPlaying(song) {
    // Desktop player
    document.getElementById('trackName').textContent = song.title;
    document.getElementById('trackArtist').textContent = song.artist;
    const trackImg = document.getElementById('trackImg');
    trackImg.src = song.image || '';
    trackImg.onerror = () => trackImg.src = '';
    
    // Mobile player
    document.getElementById('mobileTrackName').textContent = song.title;
    document.getElementById('mobileTrackArtist').textContent = song.artist;
    const mobileTrackImg = document.getElementById('mobileTrackImg');
    mobileTrackImg.src = song.image || '';
    mobileTrackImg.onerror = () => mobileTrackImg.src = '';
    
    // Fullscreen player
    document.getElementById('fullscreenTitle').textContent = song.title;
    document.getElementById('fullscreenArtist').textContent = song.artist;
    const fullscreenImg = document.getElementById('fullscreenImg');
    fullscreenImg.src = song.image || '';
    fullscreenImg.onerror = () => fullscreenImg.src = '';
}

// Toggle play/pause
function togglePlay() {
    if (!currentSong) {
        if (allSongs.length > 0) {
            playSong(allSongs[0].id);
        }
        return;
    }
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play().catch(() => {
            isPlaying = true;
        });
        isPlaying = true;
    }
    updatePlayButton();
}

// Update play button
function updatePlayButton() {
    const icon = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    
    document.getElementById('playBtn').innerHTML = icon;
    document.getElementById('mobilePlayBtn').innerHTML = icon;
    document.getElementById('fullscreenPlayBtn').innerHTML = icon;
    
    // Update all song item play buttons
    if (currentSong) {
        const songPlayBtns = document.querySelectorAll(`.play-btn-${currentSong.id}`);
        songPlayBtns.forEach(btn => {
            btn.innerHTML = icon;
            btn.title = isPlaying ? 'Pause' : 'Play';
        });
    }
}

// Previous/Next song
function prevSong() {
    if (!currentSong || allSongs.length === 0) return;
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    playSong(allSongs[prevIndex].id);
}

function nextSong() {
    if (!currentSong || allSongs.length === 0) return;
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % allSongs.length;
    playSong(allSongs[nextIndex].id);
}

// Mobile player functions
function openMobilePlayer() {
    if (currentSong) {
        document.getElementById('fullscreenPlayer').style.display = 'block';
    }
}

function closeMobilePlayer() {
    document.getElementById('fullscreenPlayer').style.display = 'none';
}

// Download song
function downloadSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    const link = document.createElement('a');
    link.href = song.file;
    link.download = `${song.artist} - ${song.title}.mp3`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadCurrent() {
    if (currentSong) {
        downloadSong(currentSong.id);
    }
}

// Toggle like
function toggleLike(songId) {
    const songIndex = likedSongs.indexOf(songId);
    const likedPlaylist = playlists.find(p => p.name === 'Liked Songs');
    
    if (songIndex > -1) {
        // Remove from liked
        likedSongs.splice(songIndex, 1);
        if (likedPlaylist) {
            const playlistIndex = likedPlaylist.songs.indexOf(songId);
            if (playlistIndex > -1) {
                likedPlaylist.songs.splice(playlistIndex, 1);
            }
        }
    } else {
        // Add to liked
        likedSongs.push(songId);
        if (likedPlaylist) {
            likedPlaylist.songs.push(songId);
        }
    }
    
    // Save to local storage
    saveToStorage('vnSongs_likedSongs', likedSongs);
    saveToStorage('vnSongs_playlists', playlists);
    
    // Update like button appearance
    updateLikeButtons(songId);
}

// Update like button appearance
function updateLikeButtons(songId) {
    const isLiked = likedSongs.includes(songId);
    const likeButtons = document.querySelectorAll(`[onclick*="toggleLike(${songId})"]`);
    
    likeButtons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
            btn.style.color = isLiked ? '#1db954' : '#b3b3b3';
        }
    });
}

// Audio controls
function seek() {
    const slider = event.target;
    const seekTime = (slider.value / 100) * audio.duration;
    if (!isNaN(seekTime)) {
        audio.currentTime = seekTime;
    }
}

function changeVolume() {
    const slider = document.getElementById('volumeSlider');
    audio.volume = slider.value / 100;
    slider.style.setProperty('--volume', slider.value + '%');
}

function toggleVolume() {
    const slider = document.getElementById('volumeSlider');
    if (slider.value > 0) {
        slider.dataset.prevValue = slider.value;
        slider.value = 0;
    } else {
        slider.value = slider.dataset.prevValue || 50;
    }
    changeVolume();
}

function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        
        // Update all progress bars
        const sliders = ['progressSlider', 'mobileProgressSlider', 'fullscreenProgressSlider'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = progress;
                slider.style.setProperty('--progress', progress + '%');
            }
        });
        
        // Update time displays
        const currentTimeElements = ['currentTime', 'fullscreenCurrentTime'];
        currentTimeElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatTime(audio.currentTime);
            }
        });
    }
}

function updateDuration() {
    const totalTimeElements = ['totalTime', 'fullscreenTotalTime'];
    totalTimeElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatTime(audio.duration);
        }
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Navigation
function goBack() {
    switchSection('home');
}