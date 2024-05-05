const Movie = require("../models/movie");

const mongoose = require("mongoose");

const fs = require("fs");

function addZeros(movieID) {
    let preresult = "" + movieID;

    for (let i = preresult.length; i < 7; i++) {
        preresult = "0" + preresult;
    }

    return preresult;
}

async function fetchIMDB(movieID) {
    try {
        const fetchres = await fetch(`https://search.imdbot.workers.dev/?tt=tt${addZeros(movieID)}`);
        const jsonedResult = await fetchres.json();

        if (jsonedResult.imdbId === "tt"+addZeros(movieID)) {
            const newMovie = new Movie({...jsonedResult});

            try {
                if (jsonedResult.short["@type"] === "VideoGame" || jsonedResult.short["@type"] === "TVEpisode" || jsonedResult.short["@type"] === "MusicVideoObject") {
                    console.log(addZeros(movieID), "is a game or an episode or a music clip ", jsonedResult.short["@type"], jsonedResult.short.name)
                }
                else {
                    const added = await newMovie.save();
                    console.log(added.imdbId, added.short.name);
                }

            }
            catch (e) {
                fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее [коллизия уникальных ключей]\r\n`)
                console.log(`${addZeros(movieID)} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее`);
            }
        } else {
            // if (jsonedResult.imdbId === undefined) throw new Error(addZeros(movieID) + " server has got an UNDEFINED result")
            try {
                fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан\r\n`)
                console.log(`${addZeros(movieID)} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан`);
            }
            catch (e) {
                fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]\r\n`)
                console.log(`${addZeros(movieID)} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]`);
            }
        }

        movieID = parseInt(movieID) + 7;
        fetchIMDB(movieID);
    } catch (e) {
        console.log(e.message);
        setTimeout(() => fetchIMDB(movieID), 30000)
    }

}

module.exports = {fetchIMDB, addZeros};