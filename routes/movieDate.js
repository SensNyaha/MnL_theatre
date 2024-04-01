const express = require('express');
const router = express.Router();

const uuid = require("uuid").v4;
const shortId = require("shortid");

const Movie = require("../models/movie");
const MovieDateRoom = require("../models/movieDateRoom");

// GET запрос на создание комнаты свидания, в который в query.creator МОЖНО и НУЖНО передать имя автора, открывающего эту комнату
router.post("/create", async (req, res) => {
    const host = req.body.host || "default name";

    const movieDateRoomObj = new MovieDateRoom({
        users: {
            user1: {
                username: host,
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
    }, 120_000)
})

// GET запрос на создание контента очереди из фильмов
router.post("/fullfillquery", async (req, res) => {
    const {uuid} = req.body;

    if (!uuid) return res.status(400).json({status: 400, message: "No uuid was attached with request"})

    const genres = req.query.genres; //[&]genres=Short,Western[&]
    const years = req.query.years; //[&]years=1910-2020[&]
    const countries = req.query.countries; //[&]countries=GB,US[&]
    const hasSeries = req.query.hasSeries; //[&]hasSeries=false[&]
    const rating = req.query.rating; //[&]rating=7-10[&]

    const filterObject = {};
    // фильтр по жанрам
    const genresArray = genres?.split(",").map(e => e.trim()).map(e => e[0].toUpperCase() + e.slice(1)) || [/w*/];
    filterObject["short.genre"] = {
        $in: genresArray
    }

    // фильтр по годам
    const yearsArray = years?.split("-") || [];
    if (!yearsArray[0]) yearsArray[0] = 0;
    if (!yearsArray[1]) yearsArray[1] = 2100;
    filterObject["main.releaseYear.year"] = {
        $gt: +yearsArray[0],
        $lt: +yearsArray[1],
    };

    // фильтр по странам
    const countriesArray = countries?.split(",").map(e => e.trim()).map(e => e[0].toUpperCase() + e.slice(1)) || [/w*/];
    filterObject["main.countriesOfOrigin.countries"] = {
        $elemMatch: {
            "id": {
                $in: countriesArray
            }
        }
    }

    // фильтр по сериалам/полнометражкам
    filterObject["main.canHaveEpisodes"] = hasSeries === "true";

    // фильтр по рейтингу
    const ratingArray = rating?.split("-") || [];
    if (!ratingArray[0]) ratingArray[0] = 0;
    if (!ratingArray[1]) ratingArray[1] = 10;
    filterObject["short.aggregateRating.ratingValue"] = {
        $gt: +ratingArray[0],
        $lt: +ratingArray[1],
    };

    const foundMovies = await Movie.find(filterObject);

    const foundMovieDate = await MovieDateRoom.findOneAndUpdate({uuid}, {moviesQuery: foundMovies});
    if (!foundMovieDate) {
        return res.json({status: 404, message: "No room found with the same uuid"});
    }

    res.json(foundMovieDate);
})

// POST запрос на присоединение к существущей комнате
router.post("/join/:shortid", async (req, res) => {

})

module.exports = router;
