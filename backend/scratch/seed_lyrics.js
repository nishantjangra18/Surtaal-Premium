const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Song = require('../models/Song');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const sampleLyrics = [
    { time: 0, text: "Welcome to SurTaal! Let the music flow..." },
    { time: 4, text: "Feel the beats, feel the rhythm of the taal." },
    { time: 9, text: "This is a demonstration of our synchronized lyrics." },
    { time: 14, text: "Notice how the lines highlight as the song plays." },
    { time: 19, text: "It auto-scrolls to keep the active line in focus." },
    { time: 24, text: "You can click on any line of these lyrics to seek!" },
    { time: 29, text: "Give it a try — click another line to jump timeline." },
    { time: 34, text: "SurTaal — Suron Ka Safar, Taal Ke Saath." },
    { time: 39, text: "Enjoy your premium listening experience!" }
];

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        let song = await Song.findOne({ title: /Victory Anthem/i });
        if (song) {
            console.log(`Updating existing song: "${song.title}"`);
            song.lyrics = sampleLyrics;
            await song.save();
            console.log('Synced lyrics updated successfully.');
        } else {
            console.log('Creating a new test song with synced lyrics...');
            song = new Song({
                title: "Victory Anthem",
                artist: "SurTaal Crew",
                album: "SurTaal Anthem",
                genre: "Progressive",
                language: "English",
                duration: 372,
                cover: "/Covers/dhun.jpg",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                lyrics: sampleLyrics
            });
            await song.save();
            console.log(`Successfully created song: "${song.title}" with synced lyrics.`);
        }
        
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seed();
