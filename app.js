const express = require('express'); //imports the express module - used to build web servers and APIs quickly and easily 
const app = express(); //initialize an Express application by calling express()
const port = 3000; // setting the Port

app.use(express.json()); //adds middleware (function) to the Express application, enabling it to parse incoming requests with JSON payloads.
// middleware is a function that processes requests before they reach the route handler. Middleware can be used for things like parsing data, logging, error handling, etc.
// without this, the server wouldn’t be able to automatically parse and understand application/json requests.

// Data in Memory (data will be lost when the server restarts.)
let actors = [
    {
        id: 1,
        firstName: "Leo",
        lastName: "Dicaprio",
        dateOfBirth: "1974-11-11"
    }
];
let movies = [
    {
        id: 1,
        title: "Inception",
        creationDate: "2010-07-16",
        actor: {
            id: 1,
            firstName: "Leo",
            lastName: "Dicaprio",
            dateOfBirth: "1974-11-11"
        }
    }
];

// Utility function checksif given date is in the future (birth dates in the future should not be allowed.)
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

// Utility function to find an actor in actors array by their ID. It’s used to find actors when associating them with movies.
const findActorById = (id) => {
    return actors.find(actor => actor.id === parseInt(id));
};

//---------------------------------------Actors Routes--------------------------------------//

//--> Create a new actor
app.post('/actors', (req, res) => { //start of the route handler for creating a new actor. It responds to POST requests at the /actors endpoint.
    const { firstName, lastName, dateOfBirth } = req.body; //extract the firstName, lastName, and dateOfBirth from the request body.

    // Check if date of birth is in the future
    if (isFutureDate(dateOfBirth)) { //checks if the provided dateOfBirth is in the future using the isFutureDate utility function. 
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' }); //if yes- 400 response is sent with message
    }

    const actor = { //new actor object is created with:
        id: actors.length + 1, //set to the current length of the actors array + 1
        firstName,
        lastName,
        dateOfBirth
    };

    actors.push(actor); // actor is added to the actors array
    res.status(201).json(actor); //201 response is sent back with the newly created actor as JSON
});

//--> Get all actors
app.get('/actors', (req, res) => { //handles GET requests at the /actors endpoint.
    res.json(actors); //returns all the actors in the actors array as a JSON response.
});

//--> Get an actor by ID
app.get('/actors/:id', (req, res) => { // route handles GET requests at /actors/:id, where :id is a placeholder for an actor's ID.
    const actor = findActorById(req.params.id); //find the actor based on the id from the request parameters (req.params.id).
    if (!actor) { //If actor not found, it returns a 404 response and message
        return res.status(404).json({ message: 'Actor not found' }); 
    }
    res.json(actor); //if found - sends the actor object as JSON.
});

//--> Update an actor by ID
app.put('/actors/:id', (req, res) => { //route handles PUT requests at /actors/:id to update an actor by their ID.
    const actor = findActorById(req.params.id); //looks for the actor in the actors array using function (findActorById)
    if (!actor) { //If actor not found, it returns a 404 response.
        return res.status(404).json({ message: 'Actor not found' }); 
    }

    const { firstName, lastName, dateOfBirth } = req.body; //The request body may contain updated values for firstName, lastName, and dateOfBirth.

    if (isFutureDate(dateOfBirth)) { //validates that the dateOfBirth is not in the future.
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    //If new values are provided in the request body, they overwrite the existing values. If a value isn’t provided, the existing value is kept.
    actor.firstName = firstName || actor.firstName;
    actor.lastName = lastName || actor.lastName;
    actor.dateOfBirth = dateOfBirth || actor.dateOfBirth;

    res.json(actor); //updated actor is sent as the response.
});

//--> Delete an actor by ID
app.delete('/actors/:id', (req, res) => { //route handles DELETE requests at /actors/:id to delete an actor by their ID.
    const actorIndex = actors.findIndex(actor => actor.id === parseInt(req.params.id)); //looks for the actor's index in the actors array.
    if (actorIndex === -1) { //If actor isn't found - returns a 404 Not Found response.
        return res.status(404).json({ message: 'Actor not found' }); 
    }

    actors.splice(actorIndex, 1); // if found -  actor is removed from the array using splice()
    res.status(204).send(); // 204 No Content response is sent (indicating successful deletion with no content to return).
});

//---------------------------------------Movies Routes--------------------------------------//

//--> Create a new movie (actorId must be provided)
app.post('/movies', (req, res) => { //route handles POST requests at /movies to create a new movie.
    const { title, creationDate, actorId } = req.body; //extracts title, creationDate, and actorId from the request body.

    // Check if actorId is provided
    if (!actorId) { //If actorId is not supplied, a 400 Bad Request response is returned.
        return res.status(400).json({ message: 'Actor ID must be supplied.' });
    }

    // Check if actor exists
    const actor = findActorById(actorId); //Uses a helper function findActorById to search for an actor with the given actorId. This function returns the actor object if found, or undefined if not.
    if (!actor) { //If the actorId is provided but no matching actor is found, a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Actor not found' }); 
    }

    const movie = { // Creates a new movie object.
        id: movies.length + 1, //Assigns an id to the new movie. The id is set to the length of the movies array plus one, ensuring a unique id for the new movie.
        title, //Uses the title extracted from the request body.
        creationDate,
        actor
    };

    movies.push(movie); //movie is added to the movies array
    res.status(201).json(movie); //201 Created response is sent with the new movie.
});

//--> Get all movies
app.get('/movies', (req, res) => {
    res.json(movies); //route returns all movies in the movies array as a JSON response.
});

//--> Get a movie by ID
app.get('/movies/:id', (req, res) => { // route that handles GET requests made to the /movies/:id URL path. In this route, :id is a URL parameter that represents the movie's ID.
    const movie = movies.find(movie => movie.id === parseInt(req.params.id)); //searches the movies array to find a movie that matches the id provided in the URL (req.params.id).The parseInt() function converts the string id from the URL to an integer.
    if (!movie) { //If movie is not found, a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Movie not found' }); 
    }
    res.json(movie); //if found - movie is returned as JSON.
});

//--> Update a movie by ID (actorId must be provided)
app.put('/movies/:id', (req, res) => { //route updates a movie by its id. expects the id to be passed as a URL parameter (:id). The handler receives both the req (request) and res (response) objects.
    const movie = movies.find(movie => movie.id === parseInt(req.params.id)); //searches the movies array to find a movie that matches the id provided in the URL (req.params.id).The parseInt() function converts the string id from the URL to an integer.
    if (!movie) { // If movie isn't found - a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Movie not found' });
    }

    const { title, creationDate, actorId } = req.body; //destructures the title, creationDate, and actorId from the request body (req.body). These values are what the user wants to update in the movie.

    if (actorId) { //If an actorId is provided in the request body, this checks if the actorId exists.
        const actor = findActorById(actorId); //findActorById function to search for the actor in the actors array.
        if (!actor) { // If not, a 404 Not Found response is returned.
            return res.status(404).json({ message: 'Actor not found' });
        }
        movie.actor = actor; //If the actor is found, the movie.actor is updated with the actor object.
    }

    //update the movie.title and movie.creationDate. If the user provided new values in the request body, they will be updated; otherwise, the original values are kept.
    movie.title = title || movie.title;
    movie.creationDate = creationDate || movie.creationDate;

    res.json(movie); //After updating the movie, the response sends back the updated movie object as a JSON response.
});

//--> Delete a movie by ID
app.delete('/movies/:id', (req, res) => { //route deletes a movie based on its id
    const movieIndex = movies.findIndex(movie => movie.id === parseInt(req.params.id)); //searches for the index of the movie that matches the id in the URL. It uses findIndex() to return the index of the movie in the movies array. ParseInt() is used to convert the string id from the URL to an integer.

    if (movieIndex === -1) { //If findIndex() returns -1, it means that no movie with the specified id was found in the movies array.
        return res.status(404).json({ message: 'Movie not found' }); //404 Not Found response is returned with the message 
    }

    movies.splice(movieIndex, 1); // removes the movie from the movies array using splice(). The splice(movieIndex, 1) removes the movie at the specified index (movieIndex) and deletes exactly one item from the array.
    res.status(204).send(); //After the movie is successfully deleted, a 204 No Content response is sent.
});

//------------------------------------------Server-----------------------------------------//

//starts the server and makes it listen for incoming HTTP requests on the port defined earlier -> 3000
app.listen(port, () => {
    console.log(`Movie and Actor API listening at http://localhost:${port}`);
});
