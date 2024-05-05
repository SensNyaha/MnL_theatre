const express = require('express');
const router = express.Router();

const Movie = require("../models/movie");

// Получить информацию о фильме с возможностью получения сокращенной информации для экономии сетевого трафика при передаче query short == true
router.get("/id/:id", async (req, res) => {
    const ttId = req.params.id;
    const isShortAsked = req.query.short === "true";

    const movieObj = await Movie.findOne({imdbId: ttId});

    if (movieObj) {
        isShortAsked ? res.json({imdbId: movieObj.imdbId, short: movieObj.short, status: 200}) : res.json({...movieObj, status: 200});
    } else {
        res.status(404).json({status: 404, message: "Not found!"});
    }
})
module.exports = router;
