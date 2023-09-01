const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const startDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

startDBAndServer();
const convertMovieNameIntoPascalCase = (eachMovieNameObj) => {
  return {
    movieName: eachMovieNameObj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  //const {movieId} = request.params;
  const getMovieNameObj = `
    SELECT * FROM movie WHERE movie_id;
    `;
  const getMovieName = await db.all(getMovieNameObj);
  response.send(
    getMovieName.map((eachMovieName) =>
      convertMovieNameIntoPascalCase(eachMovieName)
    )
  );
});

app.post("/movies/", async (request, response) => {
  const addMovieNameQuery = request.body;
  const { directorId, movieName, leadActor } = addMovieNameQuery;
  const addMovieName = `
    INSERT INTO 
     movie(
         director_id,
         movie_name,
         lead_actor         
     )
     VALUES 
     ('${directorId}',
     '${movieName}',
     '${leadActor}')
         `;
  const dbResponse = await db.run(addMovieName);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});
const convertMovieIdIntoPascalScale = (movieIdObj) => {
  return {
    movieId: movieIdObj.movie_id,
    directorId: movieIdObj.director_id,
    movieName: movieIdObj.movie_name,
    leadActor: movieIdObj.lead_actor
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieNameQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId} 
    `;
  const movie = await db.get(getMovieNameQuery);
  response.send(
      convertMovieIdIntoPascalScale(movie)
  );
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getEachMovieNameQuery = request.body;
  const { directorId, movieName, leadActor } = getEachMovieNameQuery;
  const EachMovieNameQuery = `
  UPDATE 
  movie 
    SET
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'       
    
    WHERE movie_id = ${movieId}`;
  const getEachMovieName = await db.run(EachMovieNameQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMoviesQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}
    `;
  const deleteMovie = await db.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

const convertDirectorNameIntoPascalScale = (directorNameObj) => {
  return {
    directorId: directorNameObj.director_id,
    directorName: directorNameObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorName = `
    SELECT *
    FROM director
    WHERE director_id`;
  const directorName = await db.all(getDirectorName);
  response.send(
    directorName.map((eachDirector) =>
      convertDirectorNameIntoPascalScale(eachDirector)
    )
  );
});

const convertEachDirectorNameIntoPascalScale = (eachDirectorNameObj) => {
  return {
    movieName: eachDirectorNameObj.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieName = `
    SELECT 
    movie_name 
    FROM 
    director 
    INNER JOIN movie ON director.director_id = movie.director_id
    WHERE director.director_id = ${directorId}`;
  const getDirectorMovieNameArray = await db.all(getDirectorMovieName);
   
  response.send(
    getDirectorMovieNameArray.map((eachDirectorObj) =>
      convertEachDirectorNameIntoPascalScale(eachDirectorObj)
    )
  );
});

module.exports = app;
