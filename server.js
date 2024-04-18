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
const positionsRouter = require('./routes/positions')
const rolesRouter = require('./routes/roles')
const associationsRouter = require('./routes/associations')
const notificationsRouter = require('./routes/notifications')
app.use('/users', usersRouter)
app.use('/schools', schoolsRouter)
app.use('/lrs', lrsRouter)
app.use('/positions', positionsRouter)
app.use('/roles', rolesRouter)
app.use('/associations', associationsRouter)
app.use('/notifications', notificationsRouter)

app.listen('4000', () => console.log('Server started'))

const User = require('./models/user')
const School = require('./models/school')

//run()
/*async function run() {
    const newSchool = new Schools({ name: 'Jaclupan ES' })
    await newSchool.save();
    console.log(newSchool)
}*/
/*async function run() {
    const school = new School({
        name: "Testing Uni"
    })

    await school.save()

    const user = new User({
        "name": "testing3",
        "password": "testing nasad",
        "email": "j.nayon123@gmail.com",
        "phone": "09267288567",
        "schools": [school._id]
    });

    await user.save();
    console.log("User and associated school created successfully!");
}*/