const express = require('express'); //Imports the express module - used to build web servers and APIs quickly and easily.
const app = express(); //Initialize an Express application by calling express().
const port = 3000; //Setting the Port.

app.use(express.json()); //Adds middleware (function) to the Express application, enabling it to parse incoming requests with JSON payloads.
//Middleware is a function that processes requests before they reach the route handler. Middleware can be used for things like parsing data, logging, error handling, etc.
//Without this, the server wouldn’t be able to automatically parse and understand application/json requests.

//Data in Memory (data will be lost when the server restarts).
let actors = [];
let movies = [];

//Utility function checks if given date is in the future (birth dates in the future should not be allowed).
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

//Utility function to find an actor in actors array by their ID. It’s used to find actors when associating them with movies.
const findActorById = (id) => {
    return actors.find(actor => actor.id === parseInt(id));
};

//---------------------------------------Actors Routes--------------------------------------//

//--> Create a new actor
app.post('/actors', (req, res) => { //Start of the route handler for creating a new actor. It responds to POST requests at the /actors endpoint.
    const { firstName, lastName, dateOfBirth } = req.body; //Extract the firstName, lastName, and dateOfBirth from the request body.

    //Validate that firstName, lastName, and dateOfBirth are provided.
    if (!firstName || !lastName || !dateOfBirth) {
        return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
    }

    //Check if date of birth is in the future.
    if (isFutureDate(dateOfBirth)) { //Checks if the provided dateOfBirth is in the future using the isFutureDate utility function. 
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' }); //If yes- 400 response is sent with message.
    }

    const actor = { //New actor object is created with:
        id: actors.length + 1, //set to the current length of the actors array + 1
        firstName,
        lastName,
        dateOfBirth
    };

    actors.push(actor); //Actor is added to the actors array.
    res.status(201).json(actor); //201 response is sent back with the newly created actor as JSON.
});

//--> Get all actors
app.get('/actors', (req, res) => { //Handles GET requests at the /actors endpoint.
    res.json(actors); //Returns all the actors in the actors array as a JSON response.
});

//--> Get an actor by ID
app.get('/actors/:id', (req, res) => { //Route handles GET requests at /actors/:id, where :id is a placeholder for an actor's ID.
    const actor = findActorById(req.params.id); //Find the actor based on the id from the request parameters (req.params.id).

    if (!actor) { //If actor not found, it returns a 404 response and message.
        return res.status(404).json({ message: 'Actor not found' }); 
    }
    res.json(actor); //if found - sends the actor object as JSON.
});

//--> Update an actor by ID
app.put('/actors/:id', (req, res) => { //Route handles PUT requests at /actors/:id to update an actor by their ID.
    const actor = findActorById(req.params.id); //Looks for the actor in the actors array using function (findActorById).

    if (!actor) { //If actor not found, it returns a 404 response.
        return res.status(404).json({ message: 'Actor not found' }); 
    }

    const { firstName, lastName, dateOfBirth } = req.body; //The request body may contain updated values for firstName, lastName, and dateOfBirth.

    if (!firstName || !firstName.trim()) { //Validate that none of the required fields are empty or undefined.
        return res.status(400).json({ message: 'First name cannot be empty.' });
    }
    if (!lastName || !lastName.trim()) {
        return res.status(400).json({ message: 'Last name cannot be empty.' });
    }
    if (!dateOfBirth) {
        return res.status(400).json({ message: 'Date of birth cannot be empty.' });
    }

    if (isFutureDate(dateOfBirth)) { //Validates that the dateOfBirth is not in the future.
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    //If new values are provided in the request body, they overwrite the existing values. If a value isn’t provided, the existing value is kept.
    actor.firstName = firstName || actor.firstName;
    actor.lastName = lastName || actor.lastName;
    actor.dateOfBirth = dateOfBirth || actor.dateOfBirth;

    res.json(actor); //Updated actor is sent as the response.
});

//--> Delete an actor by ID
app.delete('/actors/:id', (req, res) => { //Route handles DELETE requests at /actors/:id to delete an actor by their ID.
    const actorId = parseInt(req.params.id); //This extracts the id from the request URL (req.params.id) and converts it to an integer using parseInt().

    // Check if the actor is assigned to any movie
    const actorInMovie = movies.some(movie => movie.actor.id === actorId); //Checks if the actor is assigned to any movie. The movies.some() method iterates over the movies array and returns true if at least one movie contains the actor with the matching id.

    if (actorInMovie) { //This condition checks whether the actor is assigned to any movie
        return res.status(400).json({ message: 'Cannot delete actor because they are assigned to a movie.' }); // Return 400 Bad Request
    }

    const actorIndex = actors.findIndex(actor => actor.id === actorId); //If the actor isn't assigned to any movie, this line finds the index of the actor in the actors array. It uses the findIndex() method to search for the actor whose id matches the actorId extracted from the URL. If the actor is found, actorIndex will store their position in the array. If no match is found, actorIndex will be -1.

    if (actorIndex === -1) { //This condition checks if the actor was found in the actors array (if findIndex() returned -1, the actor was not found).
        return res.status(404).json({ message: 'Actor not found' });
    }

    actors.splice(actorIndex, 1); //Removes the actor from the actors array if they were found and not assigned to any movie. The splice() method removes the element at the index actorIndex from the array, and 1 specifies that only one item (the actor) should be removed.    
    res.status(204).send(); //204 No Content response is sent (indicating successful deletion with no content to return).
});

//---------------------------------------Movies Routes--------------------------------------//

//--> Create a new movie (actorId must be provided)
app.post('/movies', (req, res) => { //Route handles POST requests at /movies to create a new movie.
    const { title, creationDate, actorId } = req.body; //Extracts title, creationDate, and actorId from the request body.

    //Check if actorId is provided
    if (!actorId) { //If actorId is not supplied, a 400 Bad Request response is returned.
        return res.status(400).json({ message: 'Actor ID must be supplied.' });
    }

    //Check if actor exists
    const actor = findActorById(actorId); //Uses a helper function findActorById to search for an actor with the given actorId. This function returns the actor object if found, or undefined if not.
    if (!actor) { //If the actorId is provided but no matching actor is found, a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Actor not found' }); 
    }

    //Validate that the title is not empty or only spaces.
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    //Validate that the creationDate is not empty.
    if (!creationDate) {
        return res.status(400).json({ message: 'Creation date cannot be empty.' });
    }

    const movie = { //Creates a new movie object.
        id: movies.length + 1, //Assigns an id to the new movie. The id is set to the length of the movies array plus one, ensuring a unique id for the new movie.
        title, //Uses the title extracted from the request body.
        creationDate,
        actor
    };

    movies.push(movie); //Movie is added to the movies array.
    res.status(201).json(movie); //201 Created response is sent with the new movie.
});

//--> Get all movies
app.get('/movies', (req, res) => {
    res.json(movies); //Route returns all movies in the movies array as a JSON response.
});

//--> Get a movie by ID
app.get('/movies/:id', (req, res) => { //Route that handles GET requests made to the /movies/:id URL path. In this route, :id is a URL parameter that represents the movie's ID.
    const movie = movies.find(movie => movie.id === parseInt(req.params.id)); //Searches the movies array to find a movie that matches the id provided in the URL (req.params.id).The parseInt() function converts the string id from the URL to an integer.

    if (!movie) { //If movie is not found, a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Movie not found' }); 
    }

    res.json(movie); //If found - movie is returned as JSON.
});

//--> Update a movie by ID (actorId must be provided)
app.put('/movies/:id', (req, res) => { //Route updates a movie by its id. expects the id to be passed as a URL parameter (:id). The handler receives both the req (request) and res (response) objects.
    const movie = movies.find(movie => movie.id === parseInt(req.params.id)); //Searches the movies array to find a movie that matches the id provided in the URL (req.params.id).The parseInt() function converts the string id from the URL to an integer.

    if (!movie) { //If movie isn't found - a 404 Not Found response is returned.
        return res.status(404).json({ message: 'Movie not found' });
    }

    const { title, creationDate, actorId } = req.body; //Destructures the title, creationDate, and actorId from the request body (req.body). These values are what the user wants to update in the movie.

    //Ensure all required fields are provided
    if (!title || !creationDate || !actorId) {
        return res.status(400).json({ message: 'Title, creation date, and actor ID must be provided.' });
    }

    //Validate that actorId exists
    const actor = findActorById(actorId);
    if (!actor) {
        return res.status(404).json({ message: 'Actor not found' });
    }

    //Update movie properties
    movie.title = title;
    movie.creationDate = creationDate;
    movie.actor = actor;

    res.json(movie); //Send back the updated movie object as JSON.
});

//--> Delete a movie by ID
app.delete('/movies/:id', (req, res) => { //Route deletes a movie based on its id.
    const movieIndex = movies.findIndex(movie => movie.id === parseInt(req.params.id)); //Searches for the index of the movie that matches the id in the URL. It uses findIndex() to return the index of the movie in the movies array. ParseInt() is used to convert the string id from the URL to an integer.

    if (movieIndex === -1) { //If findIndex() returns -1, it means that no movie with the specified id was found in the movies array.
        return res.status(404).json({ message: 'Movie not found' }); //404 Not Found response is returned with the message.
    }

    movies.splice(movieIndex, 1); //Removes the movie from the movies array using splice(). The splice(movieIndex, 1) removes the movie at the specified index (movieIndex) and deletes exactly one item from the array.
    res.status(204).send(); //After the movie is successfully deleted, a 204 No Content response is sent.
});

//------------------------------------------Server-----------------------------------------//

//Starts the server and makes it listen for incoming HTTP requests on the port defined earlier -> 3000.
app.listen(port, () => {
    console.log(`Movie and Actor API listening at http://localhost:${port}`);
});
