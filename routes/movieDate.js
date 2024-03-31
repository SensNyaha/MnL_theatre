const express = require('express');
const router = express.Router();

const uuid = require("uuid").v4;
const shortId = require("shortid");

const MovieDateRoom = require("../models/movieDateRoom");

// GET запрос на создание комнаты свидания, в который в query.creator МОЖНО и НУЖНО передать имя автора, открывающего эту комнату
router.get("/create", async (req, res) => {
    console.log(req.query.creator);
    const creator = req.query.creator || "default name";

    const movieDateRoomObj = new MovieDateRoom({
        users: {
            user1: {
                username: creator,
                ratedFilms: {
                    likedFilms: [],
                    dislikedFilms: [],
                    skippedFilms: []
                }
            },
        },
        filters: {
            genre: [],
            years: {
                from: 0,
                to: 0
            },
            countries: [],
            hasSeries: false,
            rating: {
                from: 0,
                to: 0
            }
        },
        uuid: uuid(),
        shortId: shortId(this.uuid)
    });

    const addedMovieDateRoom = await movieDateRoomObj.save();

    res.json(addedMovieDateRoom);

    setTimeout(async () => {
        await MovieDateRoom.findOneAndDelete({uuid: movieDateRoomObj.uuid})
    }, 30000)
})
module.exports = router;
