const mongoose = require("mongoose");



const movieSchema = new mongoose.Schema({
    short: Object,
    imdbId: {
        type: String,
        unique: true
    },
    top: Object,
    main: Object,
    fake: Object,
    storyLine: Object
})

module.exports = mongoose.model("Movie", movieSchema, "movies");