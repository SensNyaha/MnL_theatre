const express = require('express');
const router = express.Router();

const uuid = require("uuid").v4;
const shortId = require("shortid");

const Movie = require("../models/movie");
const MovieDateRoom = require("../models/movieDateRoom");

const shuffleArray = require("../helpers/shuffleArray");

// GET запрос на выдачу инфо обо всех комнатах
router.get("/get", async (req, res) => {
    const allMovieRooms = await MovieDateRoom.find({}).select("-moviesQuery");

    res.json(allMovieRooms);
})

// GET запрос на выдачу инфо об одной комнате
router.get("/get/:shortId", async (req, res) => {
    const {shortId} = req.params;

    const shortIdMovieRoom = await MovieDateRoom.findOne({shortId});
    if (!shortIdMovieRoom) return res.status(404).json({status: 404, message: "Room with the same shortId not found"})

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

    const foundMovieDateRoom = await MovieDateRoom.findOne({uuid});
    if (!foundMovieDateRoom) return res.status(404).json({status: 404, message: "Not found this uuid room"})
    if (foundMovieDateRoom.started.status) return res.status(400).json({status: 400, message: "Room already started. Cant make movie query for it"})

    if (!uuid) return res.status(400).json({status: 400, message: "No uuid was attached with request"})

    const genres = req.query.genres; //[&]genres=Short,Western[&]
    const years = req.query.years; //[&]years=1910-2020[&]
    const countries = req.query.countries; //[&]countries=GB,US[&]
    const hasSeries = req.query.hasSeries; //[&]hasSeries=false[&]
    const rating = req.query.rating; //[&]rating=7-10[&]
    const maxQuerySize = parseInt(req.query.maxQuerySize) || 200; //[&]maxQuerySize=200[&]

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
    const hasSeriesFilter = hasSeries === "true"
    filterObject["main.canHaveEpisodes"] = hasSeriesFilter;

    // фильтр по рейтингу
    const ratingArray = rating?.split("-") || [];
    if (!ratingArray[0]) ratingArray[0] = 0;
    if (!ratingArray[1]) ratingArray[1] = 10;
    filterObject["short.aggregateRating.ratingValue"] = {
        $gt: +ratingArray[0],
        $lt: +ratingArray[1],
    };

    const foundMovies = await Movie.find(filterObject);

    shuffleArray(foundMovies);
    foundMovies.splice(maxQuerySize);

    const foundMovieDate = await MovieDateRoom.findOneAndUpdate({uuid}, {
        moviesQuery: foundMovies,
        filters: {
            genres: genresArray,
            years: {
                from: yearsArray[0],
                to: yearsArray[1]
            },
            countries: countriesArray,
            hasSeries: hasSeriesFilter,
            rating: {
                from: ratingArray[0],
                to: ratingArray[1]
            }
        }
    });
    if (!foundMovieDate) {
        return res.json({status: 404, message: "No room found with the same uuid"});
    }

    res.json(foundMovieDate);
})

// GET запрос на получение формы на ввод никнейма для присоединения к существующей комнате
router.get("/join", async (req, res) => {
    // Здесь надо генерить формочку
    res.render("index.html");
})

// POST запрос на присоединение к существущей комнате
router.post("/join/:shortId", async (req, res) => {
    const {shortId} = req.params;
    const {username} = req.body;

    if (!shortId) return res.status(400).json({status: 400, message: "No shortId was attached to request params"})
    if (!username) return res.status(400).json({status: 400, message: "No username was attached to request body"})

    const foundMovieRoom = await MovieDateRoom.findOne({shortId});
    if (!foundMovieRoom) return res.status(404).json({status: 404, message:"Room with the same shortId not found"})
    if (foundMovieRoom.users.user2.username) return res.status(400).json({status: 400, message:"Room is closed for connection"})

    const foundAndUpdatedMovieRoom = await MovieDateRoom.findOneAndUpdate({shortId}, {users: {user2: {username}}});

    if (!foundAndUpdatedMovieRoom) return res.status(404).json({status: 404, message: "Not found the same shortid room"})

    res.json(foundAndUpdatedMovieRoom);
})

// POST запрос на запуск активности комнаты
router.post("/start/:shortId", async (req, res) => {
    const {shortId} = req.params;

    if (!shortId) return res.status(400).json({status: 400, message: "No shortId was attached with request"});

    const foundMovieRoom = await MovieDateRoom.findOne({shortId});

    if (!foundMovieRoom.moviesQuery || !foundMovieRoom.moviesQuery.length) return res.status(400).json({status: 400, message: "You have to fullfill movies query before you start the date"});
    if (foundMovieRoom.started.status) return res.status(400).json({status: 400, message: "Movie date is already started"});

    const foundShortIdMovieRoom = await MovieDateRoom.findOneAndUpdate({shortId}, {
        started: {
            status: true,
            time: Date.now()
        }
    });
    if (!foundShortIdMovieRoom) return res.status(404).json({status: 404, message: "No shortId room exists"});

    res.json(foundShortIdMovieRoom);
})

module.exports = router;
