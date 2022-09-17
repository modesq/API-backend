require('dotenv').config();
const express = require('express'); //import express framework
const cors = require('cors');
const axios = require('axios');
const server = express();
const weatherData = require('./data/weather.json');

server.use(cors()); // make the server opened for any request

// local ip address
//port

const PORT = process.env.PORT;

server.get('/data', getData);

// http://localhost:3000/
server.get('/', (req, res) => {
    res.send("Hi from the home route");
    console.log("connected?")
})


// http://localhost:3000/test
server.get('/test', (req, res) => {
    console.log("test route");
    res.send('Hi from the other side');
})

async function getData(req, res) {
    try {
        const weather = await getWeatherData(req);
        const movies = await getMoviesData(req);
        const location = await getLocationData(req);
        const news = await getNews(req);

        res.send(new City(weather, movies, location, news));
    } catch (e) {
        console.error(e);
        res.send(undefined);
    }
}

// http://localhost:3000/getWeatherData?name=name
async function getWeatherData(req) {
    result = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&city=${req.query.cityName}&format=json`)

    const forecasts = result.data.data.map((day) => {
        return new Forecast(day.datetime, day.max_temp, day.low_temp, day.weather.description)
    });
    // console.log(forecasts);
    return forecasts;
}

async function getMoviesData(req) {
    const cityName = req.query.cityName;
    const URL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_KEY}&language=en-US&query=${cityName}&page=1&include_adult=false`;
    return axios.get(URL)
        .then(result => {
            let movies = result.data.results.map(item => {
                return new Movie(item);
            })
            // console.log(movies);
            return movies.slice(0, 10);
        })
}

async function getLocationData(req) {
    const cityName = req.query.cityName;
    const URL = `https://us1.locationiq.com/v1/search?key=${process.env.LOCATION_KEY}&q=${cityName}&format=json`
    const result = await axios.get(URL)
    // console.log(result);
    return new Location(result.data[0].display_name, result.data[0].lon, result.data[0].lat);
}


async function getNews(req) {
    var result = await axios.get(
        `https://newsapi.org/v2/everything?q=${req.query.cityName}&apiKey=${process.env.NEWSAPI_KEY}`
    );
    return parseArticles(result);
}
function parseArticles(res) {
    return res.data.articles.map((article) => {
        return new Article(
            article.title,
            article.description,
            article.content,
            article.urlToImage,
            article.publishedAt,
            article.source.name,
            article.url
        );
    });
}



server.get('*', (req, res) => {
    res.send("page not found");
})

server.listen(PORT, () => {
    console.log(`connected on port ${PORT}`);
})


class Forecast {
    constructor(date, highTemp, lowTemp, description) {
        this.date = date;
        this.highTemp = highTemp;
        this.lowTemp = lowTemp;
        this.description = description;
    }
}

class Movie {
    constructor(item) {
        this.title = item.title;
        this.overview = item.overview;
        this.poster_path = "https://image.tmdb.org/t/p/w500/" + item.poster_path;
        this.release_date = item.release_date;
    }
}

class Location {
    constructor(cityName, lon, lat) {
        this.cityName = cityName;
        this.lon = lon;
        this.lat = lat;
    }
}

class City {
    constructor(weather, movies, location, news) {
        this.weather = weather;
        this.movies = movies;
        this.location = location;
        this.news = news;
    }
}

class Article {
    constructor(headline, description, content, image, date, source, url) {
        this.headline = headline;
        this.description = description;
        this.content = content;
        this.image = image;
        this.date = date;
        this.source = source;
        this.url = url;
    }
}