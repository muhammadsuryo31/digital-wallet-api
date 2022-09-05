const express = require("express");
const morgan = require("morgan");
const userRoutes = require('./routes/userRoutes')
const cors = require('cors')

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/users/' ,userRoutes)

module.exports = app;