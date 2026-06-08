const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('../models/Song');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const count = await Song.countDocuments();
    console.log('Total songs in DB:', count);
    const songs = await Song.find().limit(10);
    console.log('Sample songs:', songs.map(s => ({ id: s._id, title: s.title, artist: s.artist, src: s.src })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
