// import dependencies
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const http = require('http');
// const socketIo = require('socket.io');
const flash = require('connect-flash');
const socketSingleton = require('./middleware/socketSingleton.js');
var cors = require('cors');
const cookieParser = require('cookie-parser');

// setup functions
require('dotenv').config();

// import local function
const connectDB = require('./db/connect.js');
const runScheduler = require('./db/wpad-notification-scheduler.js');
const log = require('./middleware/logger.js');
const setupLoggerMiddleware = require('./middleware/httpLogger.js');
const setupSocketManager = require('./middleware/socketManager.js');

// Initializing the express app
const app = express();
const server = http.createServer(app);
const io = socketSingleton.init(server);

setupLoggerMiddleware(app);
setupSocketManager(io);

// Express settings
app.set('trust proxy', 1);
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.SESSION_SECRET === 'production', maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(cors());
app.use(cookieParser());
// Package size middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(flash());

// Static file routes
app.use("/styles", express.static(__dirname + "/views/styles"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
app.use("/assets", express.static(__dirname + "/views/assets"));

// Widget Styling
app.use("/widgets/styles", express.static(__dirname + "/widgets/styles"));

// Widget Script Route
app.use("/widgets/dist", express.static(__dirname + "/dist"))

// API routing
app.use('/api/server', require('./routes/server.js'));
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/mp', require('./routes/mp.js'));
app.use('/api/helpdesk', require('./routes/helpdesk-socket.js'));
app.use('/api/widgets', require('./routes/widgets.js'));
app.use('/api/wpad', require('./routes/wpad.js'));
// Navigation routing
app.use('/', require('./routes/index'));

// Start the server
const port = process.env.PORT || 5000;
(async () => {
  try {
      server.listen(port, () => {
        log(`Server is listening on port ${port} - http://localhost:${port}`);
    });
    await connectDB();
    runScheduler();
  } catch (error) { console.log(error) }
})();

module.exports = {
  io
}