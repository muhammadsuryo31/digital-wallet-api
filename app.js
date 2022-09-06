const express = require("express");
const morgan = require("morgan");
const userRoutes = require('./routes/userRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const cors = require('cors')

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/users/' ,userRoutes)
app.use('/api/v1/transactions/' ,transactionRoutes)


module.exports = app;