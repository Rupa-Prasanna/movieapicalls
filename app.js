const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

convertDbObjectToResponseObject = (eachMovie) => {
  return { movieName: eachMovie.movie_name };
};

convertDbObjectToResponseObject2 = (movieDetails) => {
  return {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor
  };
};

directorResponse = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

//get movie names API

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    select *
    from movie
    `;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

//POST movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    insert into movie(director_id, movie_name, lead_actor)
    values ("${directorId}","${movieName}", "${leadActor}");
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    select *
    from movie
    where movie_id=${movieId};
    `;
  const movieDetails = await db.get(getMovieDetailsQuery);
  response.send(convertDbObjectToResponseObject2(movieDetails));
});

//PUT movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    update movie
    set 
    director_id=${directorId},
    movie_name="${movieName}",
    lead_actor="${leadActor}"
    where 
    movie_id=${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    delete from movie
    where movie_id=${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get director API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    select *
    from director;

    `;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) => directorResponse(eachDirector))
  );
});

//get movies of a director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `
    select movie_name
    from movie natural join director
    where director_id=${directorId};

    `;
  const movieNames = await db.all(getMoviesOfDirectorQuery);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});
module.exports=app;