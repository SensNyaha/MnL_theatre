const express = require('express');
const app = express();

const path = require('path');

const mongoose = require("mongoose");

const cors = require("cors");

const indexRouter = require('./routes/index');
const ttRouter = require("./routes/tt");
const movieDateRouter = require("./routes/movieDate");

const fetchIMDB = require('./processes/fetchIMDB');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tt', ttRouter);
app.use('/movieDate', movieDateRouter);


mongoose.connect("mongodb://127.0.0.1:27017/IMDB")
    .then(() => app.listen(3000, async () => {
        console.log("server started");
        let movieID = "13590";
        // await fetchIMDB(movieID);
}))