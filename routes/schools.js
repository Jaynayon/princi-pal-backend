const express = require('express')
const router = express.Router()
const School = require('../models/school')

//Getting all
router.get('/', async (req, res) => {
    try {
        const school = await School.find()
        res.json(school)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Creating one
router.post('/', getSchoolName, async (req, res) => {
    //Check school name if it exists
    if (res.school) {
        return res.status(409).json({ message: 'Duplicate school' })
    }
    const school = new School({
        name: req.body.name
    })
    try {
        const newSchool = await school.save()
        res.status(201).json(newSchool)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.patch('/:email/school', async (req, res, next) => {
    await getUserByEmail(req, res, next, { params: true });
}, async (req, res) => {
    try {
        await getSchoolName(req, res, () => { }) //check if school exists
        const schoolExists = res.user.schools.some(school => school.equals(res.school)); //check for duplicate objects
        console.log('School exists:', schoolExists); // Log the value of schoolExists

        if (!schoolExists) {
            await res.user.schools.push(res.school);
            const insert = await res.user.save();
            return res.send(insert); // Send success response if school doesn't exist
        }
        return res.status(409).json({ message: 'School already exists in User' }); // Send error response if school exists
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//Update School

//Middleware
async function getSchoolName(req, res, next) {
    let school
    try {
        school = await School.findOne({ name: req.body.name })
        /*if (school == null)
            return res.status(404).json({ message: 'Cannot find school with that name' })*/
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.school = school;
    next()//proceeds to the next function
}

module.exports = router