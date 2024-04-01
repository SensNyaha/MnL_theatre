const express = require('express');
const router = express.Router();

const uuid = require("uuid").v4;
const shortId = require("shortid");

const Movie = require("../models/movie");
const MovieDateRoom = require("../models/movieDateRoom");

// GET запрос на выдачу инфо обо всех комнатах
router.get("/get", async (req, res) => {
    const allMovieRooms = await MovieDateRoom.find({});

    res.json(allMovieRooms);
})

// GET запрос на выдачу инфо об одной комнате
router.get("/get/:shortId", async (req, res) => {
    const {shortId} = req.params;

    const shortIdMovieRoom = await MovieDateRoom.findOne({shortId});

    res.json(shortIdMovieRoom);
})

// POST запрос на создание комнаты свидания, в который в query.creator МОЖНО и НУЖНО передать имя автора, открывающего эту комнату
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

// POST запрос на создание контента очереди из фильмов
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

// GET запрос на получение формы на ввод никнейма для присоединения к существующей комнате
router.get("/join/:shortId", async (req, res) => {
    // Здесь надо генерить формочку
    res.render("index.html");
})

// POST запрос на присоединение к существущей комнате
router.post("/join/:shortId", async (req, res) => {
    const {shortId} = req.params;
    const {username} = req.body;

    if (!shortId) return res.status(400).json({status: 400, message: "No shortId was attached to request params"})
    if (!username) return res.status(400).json({status: 400, message: "No username was attached to request body"})

    const foundAndUpdatedMovieRoom = await MovieDateRoom.findOneAndUpdate({shortId}, {users: {user2: {username}}});

    if (!foundAndUpdatedMovieRoom) return res.status(404).json({status: 404, message: "Not found the same shortid room"})

    res.json(foundAndUpdatedMovieRoom);
})

module.exports = router;
