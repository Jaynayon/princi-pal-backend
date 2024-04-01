require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const usersRouter = require('./routes/users')
const schoolsRouter = require('./routes/schools')
app.use('/users', usersRouter)
app.use('/schools', schoolsRouter)

app.listen('4000', () => console.log('Server started'))

const Schools = require('./models/school')

/*run()
async function run() {
    const newSchool = new Schools({ name: 'Jaclupan ES' })
    await newSchool.save();
    console.log(newSchool)
}*/