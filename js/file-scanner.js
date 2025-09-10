// Simple file scanner for local development
async function scanMusicFiles() {
    const allSongs = [];
    const categories = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'country', 'rnb'];
    
    for (const category of categories) {
        // Try common audio file extensions
        const extensions = ['mp3', 'wav', 'm4a', 'ogg'];
        
        for (const ext of extensions) {
            for (let i = 1; i <= 20; i++) { // Check up to 20 files per extension
                try {
                    const filename = `song${i}.${ext}`;
                    const filepath = `songs/${category}/${filename}`;
                    
                    // Test if file exists by trying to create audio element
                    const audio = new Audio();
                    audio.src = filepath;
                    
                    await new Promise((resolve, reject) => {
                        audio.addEventListener('loadedmetadata', () => {
                            const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
                            allSongs.push({
                                id: allSongs.length + 1,
                                title: title.charAt(0).toUpperCase() + title.slice(1),
                                artist: 'Unknown Artist',
                                category: category,
                                file: filepath,
                                duration: formatDuration(audio.duration)
                            });
                            resolve();
                        });
                        
                        audio.addEventListener('error', () => {
                            reject();
                        });
                        
                        // Timeout after 1 second
                        setTimeout(reject, 1000);
                    });
                } catch (error) {
                    // File doesn't exist, continue
                    break;
                }
            }
        }
    }
    
    return allSongs;
}

function formatDuration(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}