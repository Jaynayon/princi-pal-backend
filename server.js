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

const usersRouter = require('./routes/UsersRouter')
const schoolsRouter = require('./routes/SchoolsRouter')
const lrsRouter = require('./routes/LRSRouter')
const jevsRouter = require('./routes/JEVRouter')
const positionsRouter = require('./routes/PositionsRouter')
const associationsRouter = require('./routes/AssociationsRouter')
const notificationsRouter = require('./routes/NotificationsRouter')
const documentsRouter = require('./routes/DocumentsRouter')
const uacsRouter = require('./routes/UACSRouter')
const exportsRouter = require('./routes/ExportsRouter')
app.use('/users', usersRouter)
app.use('/schools', schoolsRouter)
app.use('/lr', lrsRouter)
app.use('/jev', jevsRouter)
app.use('/positions', positionsRouter)
app.use('/associations', associationsRouter)
app.use('/notifications', notificationsRouter)
app.use('/documents', documentsRouter)
app.use('/uacs', uacsRouter)
app.use('/exports', exportsRouter)

app.listen('4000', () => console.log('Server started'))