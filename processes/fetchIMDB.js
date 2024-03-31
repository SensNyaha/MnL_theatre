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
    const fetchres = await fetch(`https://search.imdbot.workers.dev/?tt=tt${addZeros(movieID)}`);
    const jsonedResult = await fetchres.json();

    if (jsonedResult.imdbId === "tt"+addZeros(movieID)) {
        const newMovie = new Movie({...jsonedResult});

        try {
            const added = await newMovie.save();
            console.log(added.imdbId, added.short.name);
        }
        catch (e) {
            fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее [коллизия уникальных ключей]\r\n`)
            console.log(addZeros(movieID), `\n ${addZeros(movieID)} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее`);
        }
    } else {
        try {
            fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан\r\n`)
            console.log(`${addZeros(movieID)} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан`);
        }
        catch (e) {
            fs.appendFileSync("./processes/failedIDs.txt", `${addZeros(movieID)} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]\r\n`)
            console.log(addZeros(movieID), `\n ${addZeros(movieID)} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]`);
        }
    }


    fetchIMDB(++movieID);
}

module.exports = fetchIMDB;