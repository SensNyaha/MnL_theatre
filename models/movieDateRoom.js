const mongoose = require("mongoose");


const movieDateRoomSchema = new mongoose.Schema({
    users: {
        user1: {
            username: {
                type: String
            },
            ratedFilms: {
                likedFilms: Array,
                dislikedFilms: Array,
                skippedFilms: Array
            }
        },
        user2: {
            username: {
                type: String
            },
            ratedFilms: {
                likedFilms: Array,
                dislikedFilms: Array,
                skippedFilms: Array
            }
        }
    },
    filters: {
        genres: Array,
        years: {
            from: Number,
            to: Number
        },
        countries: Array,
        hasSeries: Boolean,
        rating: {
            from: Number,
            to: Number
        }
    },
    uuid: String,
    shortId: String,
    creationTime: {
        type: Number,
        default: Date.now
    },
    results: {
        closed: {
            type: Boolean,
            default: false
        },
        matchedMovie: String
    },
    started: {
        status: {
            type: Boolean,
            default: false
        },
        time: {
            type: Number
        }
    },
    moviesQuery: Array
})

module.exports = mongoose.model("MovieDateRoom", movieDateRoomSchema, "movieDateRooms");