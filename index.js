const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const db = require('./queries_asg')

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended:true,
    })
);

app.get('/', (request, response) => {        
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/accounts', db.getAccounts)
app.post('/inboundsms', db.inboundSMS)
app.post('/outboundsms', db.outboundSMS)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
