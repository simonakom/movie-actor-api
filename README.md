# CRUD API for movies and actors!

## Welcome!

This application is built using Express and Node.js. It provides REST CRUD API for managing movies and actors. All data is stored in memory, meaning it will be lost when the application restarts.
 
## Task

- Create REST API with Express and JS for movies and actors management.
- The API should store data in memory.
- Actor can be involved in just a single movie.
- Actor can have FirstName, LastName and DateOfBirth.
-  Date of birth cannot be in future.
-  Movie can have title, creationDate and a single actor associated. Actor Id has to be supplied.
- When creating movie:
   - If actor id is not supplied -> 400 has to be returned.
   - If actor does not exist -> 404 must be returned.
- Create CRUD for movies and actors.
- Test with Postman.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js: [Download here](https://nodejs.org/).
- npm (Node Package Manager): comes with Node.js installation.
- Postman: [Download here](https://www.postman.com/downloads/).

## Set up

- Clone this repository to your local machine.
- Navigate to the project directory.
- Make sure you have "package.json" file. If not run: `npm init` in your terminal.
- Make sure Express is installed. In not run: `npm install express`
- Make sure nodemon is instaled to automatically restart the server whenever it detects changes in code files. In not run:  `npm i nodemon -D`
- Make sure you have a `dev` script in "package.json" in order to run nodemon via `npm run dev`:

  ```bash
    "scripts": {
        "dev": "nodemon app.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
  ```

## Run

- Run the API server locally `node app.js` or `npm run dev` (nodemon).
- You should see a message: `Server is running on http://localhost:3000`

## Tests

Test scenarios are available in `test.txt`, or you can run them using Postman.

### Importing Postman Collection

- From this repository download `movie-actor-api.postman_collection.json` file to your local machine.
- In Postman, click on the "Import" button located at the top left and drop `movie-actor-api.postman_collection.json` file.
- Postman will automatically add the collection, and you will see all predefined API requests.






