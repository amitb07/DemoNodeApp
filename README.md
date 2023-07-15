# DemoNodeApp
Demo application for assignment


Setup the database
1. Install postgres, to check successful installation of postgres, open command prompt and run command: postgres --version  
    if you get the response as the version of postgres, we are good to proceed further.
2. run command: psql -U postgres -f schema.sql (the schema.sql file is added in the github repository)

Setup redis server
1. Install redis, If you are using windows system we need to use WSL. I am using Ubuntu LTS to run redis
2. launch Ubuntu LTS prompt and run command: redis-server (This will start the redis server)

Steps to setup the application:
1. Install Node.js
2. Clone the Application project from gitlab repository: https://github.com/amitb07/DemoNodeApp/tree/main
3. Launch a terminal in project repository, run the command: npm install
4. To start the application, run command:  npm run start
    This will launch the application. 
5. To see the unit tests results, run command: npm run test:coverage

Testing the API's
1. To test the API's import the postman collection provided with the project in postman folder.
2. Test the Get accounts API, to check if the database setup and service setup is working fine. You should get a resonse 200 OK.  
2. testing the /inboundsms and /outboundsms API in postman, these are a post API.
    - you can see the body of the request, it has parameters: username, auth_id, to, from, msg
    - if invalid inputs are sent in the body, we will get back response stating the error.
    - ex. missing to, from, username or auth_id parameters, or invalid length of to and from params.
3. If the invalid username and auth_id combination is sent, it will not be authenticated and gives back error response.
4. The caching logic is also implemented to check the STOP message with same from & to params
5. The logic to limit the count of /outboundsms API requests to not exceed 50 from same "from" number is also implemented.
6. The cache is initialized with expiry time as mentioned, STOP cache for 4 hrs and from request cache for 24 hrs.