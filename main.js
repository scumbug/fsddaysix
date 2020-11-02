//import libs and env
require('dotenv').config()
const express = require('express')
const hbs = require('express-handlebars')
const { getDate } = require('./helper.js')

//declare constants
const PORT = (parseInt(process.argv[2]) > 1024 && parseInt(process.argv[2])) || (parseInt(process.env.PORT) > 1024 && parseInt(process.env.PORT)) || 3000

//create express
const app = express()

//setup hbs
app.engine('hbs', hbs({ defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

//start server
app.listen(
    PORT,
    console.log(`App has started on ${PORT} at ${getDate()}`)
)