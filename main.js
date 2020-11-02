//import libs and env
require('dotenv').config()
const express = require('express')
const hbs = require('express-handlebars')
const { getDate } = require('./helper.js')
const mysql = require('mysql2/promise')

//declare constants
const PORT = (parseInt(process.argv[2]) > 1024 && parseInt(process.argv[2])) || (parseInt(process.env.PORT) > 1024 && parseInt(process.env.PORT)) || 3000
const SQL_FIND_NAME = 'SELECT * FROM apps WHERE name LIKE ? ORDER BY name LIMIT ?'

//create express
const app = express()

//setup hbs
app.engine('hbs', hbs({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs')

//setup db pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER, 
    password: process.env.DB_PWD,
    database: 'playstore',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT) || 2,
    timezone: '+08:00'
})

//helper function to check for DB before app starts
const startApp = async (app, db) => {
    try {
        //get a connection from pool
        const conn = await db.getConnection()
        console.info('Pinging db')
        await conn.ping()

        conn.release()
        
        app.listen(
            PORT,
            console.log(`App has started on ${PORT} at ${getDate()}`)
        )

    } catch(e) {
        console.error(`Unable to connnect to database: `, e)
    }
}

//landing page
app.get('/',
    (_req, res) => {
        res.status(200)
        res.type('text/html')
        res.render('index')
    })

//process search
app.get('/search',
    async (req, res) => {
        const conn = await db.getConnection()
        try {
            const [rows] = await conn.query(SQL_FIND_NAME,[`%${req.query.q}%`,10])
            const results = rows.map(
                (result) => {
                    return {
                        name: result.name,
                        category: result.category,
                        installs: result.installs,
                        rating: result.rating,
                    }
                }
            )
            res.status(200)
            res.type('text/html')
            res.render('results', { results })
        } catch (e) {
            console.log(e)
            return Promise.reject(e)
        } finally {
            await conn.release()
        }
    })

//start server
startApp(app,db)