# VN Songs (VoltNexis Songs) - Music Streaming Website

A comprehensive music streaming and download website with modern design and full functionality.

## Features

### 🎵 Core Features
- **Music Streaming**: Stream songs directly in the browser
- **Free Downloads**: Download songs for offline listening
- **Category Browsing**: Browse music by genres (Pop, Rock, Hip-Hop, Electronic, Jazz, Classical, Country, R&B)
- **Artist Profiles**: Dedicated pages for each artist with their complete collection
- **Album Pages**: Full album browsing with track listings
- **Top Charts**: Featured songs and trending music
- **Search Functionality**: Search songs, artists, and albums

### 🎨 User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Music Player**: Fixed bottom player with full controls
- **Modal Windows**: Pop-up windows for detailed views
- **Loading Animations**: Smooth loading states

### 🎛️ Player Features
- **Play/Pause Controls**: Standard playback controls
- **Progress Bar**: Seek to any position in the song
- **Volume Control**: Adjustable volume slider
- **Next/Previous**: Navigate through playlists
- **Download Button**: Quick download from player

### 📁 File Organization
```
songs/
├── pop/           # Pop music files
├── rock/          # Rock music files
├── hip-hop/       # Hip-hop music files
├── electronic/    # Electronic music files
├── jazz/          # Jazz music files
├── classical/     # Classical music files
├── country/       # Country music files
├── rnb/           # R&B music files
├── artists/       # Artist-specific folders
└── albums/        # Album-specific folders
```

## Installation & Setup

### 1. File Structure
Ensure your project has this structure:
```
web/songs/
├── index.html
├── artist.html
├── album.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   ├── artist.js
│   └── album.js
├── images/
│   ├── default-song.jpg
│   ├── default-artist.jpg
│   ├── default-album.jpg
│   └── [other images]
├── songs/
│   ├── pop/
│   ├── rock/
│   ├── hip-hop/
│   ├── electronic/
│   ├── jazz/
│   ├── classical/
│   ├── country/
│   ├── rnb/
│   ├── artists/
│   └── albums/
└── README.md
```

### 2. Adding Music Files

#### Organize by Category
Place your music files in the appropriate category folders:
- `songs/pop/` - Pop music
- `songs/rock/` - Rock music
- `songs/hip-hop/` - Hip-hop music
- etc.

#### Organize by Artist
Create subfolders in `songs/artists/`:
```
songs/artists/
├── artist-name-1/
│   ├── song1.mp3
│   ├── song2.mp3
│   └── album1/
├── artist-name-2/
│   └── songs...
```

#### Organize by Album
Create subfolders in `songs/albums/`:
```
songs/albums/
├── album-name-1/
│   ├── track1.mp3
│   ├── track2.mp3
│   └── track3.mp3
```

### 3. Adding Images
Place cover art and images in the `images/` folder:
- Song covers: `song1.jpg`, `song2.jpg`, etc.
- Artist photos: `artist1.jpg`, `artist2.jpg`, etc.
- Album covers: `album1.jpg`, `album2.jpg`, etc.

### 4. Supported Audio Formats
- MP3 (recommended)
- WAV
- OGG
- M4A

## Customization

### Adding New Songs
1. Place audio files in appropriate category folders
2. Update the `musicDatabase` object in `js/script.js`
3. Add corresponding images to the `images/` folder

### Example Song Entry
```javascript
{
    id: 1,
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    category: "pop",
    duration: "3:45",
    file: "songs/pop/song-file.mp3",
    image: "images/song-cover.jpg",
    featured: true,
    plays: 1500000
}
```

### Adding New Artists
```javascript
{
    id: 1,
    name: "Artist Name",
    image: "images/artist-photo.jpg",
    songs: [1, 2, 3], // Song IDs
    albums: ["Album 1", "Album 2"]
}
```

### Adding New Albums
```javascript
{
    id: 1,
    title: "Album Title",
    artist: "Artist Name",
    image: "images/album-cover.jpg",
    songs: [1, 2, 3], // Song IDs
    year: 2024,
    genre: "Pop"
}
```

## Usage

### Basic Navigation
1. **Home Page**: Browse featured content and categories
2. **Categories**: Click category cards to view songs by genre
3. **Artists**: Click artist cards to view their profile
4. **Albums**: Click album cards to view track listings
5. **Search**: Use the search bar to find specific content

### Playing Music
1. Click the play button on any song
2. Use the bottom player for controls
3. Download songs using the download button
4. Navigate playlists with next/previous buttons

### Artist Pages
- View artist information and statistics
- Browse all songs by the artist
- View artist's albums
- Play all songs or download entire collection

### Album Pages
- View album information and track listing
- Play individual tracks or entire album
- Download individual songs or complete album
- Browse more albums by the same artist

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Tips
1. **Optimize Images**: Use compressed JPEG/PNG files
2. **Audio Quality**: Balance file size and quality
3. **File Organization**: Keep folders organized for better performance
4. **Caching**: Enable browser caching for better load times

## Troubleshooting

### Audio Not Playing
- Check file paths in the database
- Ensure audio files are in supported formats
- Verify browser audio permissions

### Images Not Loading
- Check image file paths
- Ensure images exist in the `images/` folder
- Verify image file formats (JPG, PNG, GIF)

### Search Not Working
- Ensure JavaScript is enabled
- Check console for errors
- Verify database entries are properly formatted

## Future Enhancements
- User accounts and playlists
- Social features (likes, shares, comments)
- Advanced search filters
- Equalizer and audio effects
- Offline mode with service workers
- Admin panel for content management

## License
This project is open source and available under the MIT License.

## Support
For issues and questions, please check the troubleshooting section or create an issue in the project repository.