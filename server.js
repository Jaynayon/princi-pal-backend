require('dotenv').config()

const express = require('express')
const cors = require('cors');
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
// Allow requests from specific origin (e.g., http://localhost:3000)
app.use(cors({
    origin: 'http://localhost:3000',
    //methods: ['GET', 'POST'], // Allow only specific HTTP methods if needed
}));

const usersRouter = require('./routes/users')
const schoolsRouter = require('./routes/schools')
const lrsRouter = require('./routes/lrs')
const jevsRouter = require('./routes/jevs')
const positionsRouter = require('./routes/positions')
const associationsRouter = require('./routes/associations')
const notificationsRouter = require('./routes/notifications')
const documentsRouter = require('./routes/documents')
const uacsRouter = require('./routes/uacs')
app.use('/users', usersRouter)
app.use('/schools', schoolsRouter)
app.use('/lrs', lrsRouter)
app.use('/jevs', jevsRouter)
app.use('/positions', positionsRouter)
app.use('/associations', associationsRouter)
app.use('/notifications', notificationsRouter)
app.use('/documents', documentsRouter)
app.use('/uacs', uacsRouter)

app.listen('4000', () => console.log('Server started'))