const express = require('express');
const app = express();

const path = require('path');

const mongoose = require("mongoose");

const cors = require("cors");

const indexRouter = require('./routes/index');
const ttRouter = require("./routes/tt");
const movieDateRouter = require("./routes/movieDate");

const {fetchIMDB, addZeros} = require('./processes/fetchIMDB');
const Movie = require("./models/movie");
const fs = require("fs");
const compression = require('compression');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());

// app.use(compression({level: 9}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tt', ttRouter);
app.use('/movieDate', movieDateRouter);


mongoose.connect("mongodb://127.0.0.1:27017/IMDB")
    .then(() => app.listen(3000, async () => {
        console.log("server started");
        let movieID = "969000";
        let nextMovieId = "" + (parseInt(movieID) + 1);
        let nextnextMovieId = "" + (parseInt(movieID) + 2);
        let nextnextnextMovieId = "" + (parseInt(movieID) + 3);
        let nextnextnextnextMovieId = "" + (parseInt(movieID) + 4);
        let nextnextnextnextnextMovieId = "" + (parseInt(movieID) + 5);
        let nextnextnextnextnextnextMovieId = "" + (parseInt(movieID) + 6);
        fetchIMDB(movieID);
        fetchIMDB(nextMovieId);
        fetchIMDB(nextnextMovieId);
        fetchIMDB(nextnextnextMovieId);
        fetchIMDB(nextnextnextnextMovieId);
        fetchIMDB(nextnextnextnextnextMovieId);
        fetchIMDB(nextnextnextnextnextnextMovieId);




        //     const TypeArray = new Set(
        //         'Movie',
        //         'TVSeries',
        //         'TVEpisode',
        //         'MusicVideoObject',
        //         'VideoGame'
        //     );
        //     for (let i = 0; i < 600000; i++) {
        //             const elems = await Movie.find({"short.@type": "MusicVideoObject"});
        //             if (elems) {
        //                 Array.from(elems).forEach(e => e.imdbId)
        //             }
        //     }

        // const stringArr = new String(fs.readFileSync("./processes/failedIDs.txt")).split("\n");
        // for (let i = 0; i < stringArr.length; i++) {
        //     const string = stringArr[i];
        //
        //     if (!string.includes("undefined")) return;
        //
        //     const fetchres = await fetch(`https://search.imdbot.workers.dev/?tt=tt${string.split(" ")[0]}`);
        //     const jsonedResult = await fetchres.json();
        //     if (jsonedResult.imdbId === "tt"+string.split(" ")[0]) {
        //         const newMovie = new Movie({...jsonedResult});
        //
        //         try {
        //             const added = await newMovie.save();
        //             console.log(added.imdbId, added.short.name);
        //             stringArr.splice(i, 1);
        //             i--;
        //         }
        //         catch (e) {
        //             // newResult += `${string.split(" ")[0]} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее\n`;
        //             console.log(`${string.split(" ")[0]} ошибка при записи коллекции в БД - возможно запись этого документа была произведена ранее`);
        //             stringArr.splice(i, 1);
        //             i--;
        //         }
        //     } else {
        //         try {
        //             // newResult += `${string.split(" ")[0]} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан\n`;
        //             console.log(`${string.split(" ")[0]} возвращенный id из ответа (${jsonedResult.imdbId}) уже был ранее записан`);
        //         }
        //         catch (e) {
        //             // newResult += `${string.split(" ")[0]} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]\n`;
        //             console.log(`\n ${string.split(" ")[0]} ошибка при записи коллекции в БД [второе колено по неконсистентности ID]`);
        //         }
        //     }
        // }
        // console.log(stringArr.join("\r\n"));
        // fs.writeSync("./processes/failedIDs.txt1", stringArr.join("\r\n"));
    }))