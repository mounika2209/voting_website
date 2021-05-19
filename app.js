require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
let server = require('http').Server(app);
const socketio = require('socket.io')()
const engines = require('consolidate');
const io = socketio.listen(server)


mongoose.connect(
    process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    },
    err => {
        if (err) {
            console.log('error', err);
        } else {
            console.log('info', `Connection to Database Successfull`);
        }
    }
);

//Body parser middleware

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(compression())
app.use((req, res, next) => {
    req.userip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT, DELETE');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, authtoken, contentType, Content-Type, authorization'
    );
    next();
});

app.engine('html', engines.mustache);
app.set('view engine', 'html');


require('./routes/routes.js')(app);


server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started at port:${process.env.PORT}`)
});


module.exports = app;