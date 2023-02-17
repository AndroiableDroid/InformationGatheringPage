const express = require('express')
const path = require("path")
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express()
const port = 3000

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.post('/print', upload.single('picture'), function (req, res, next) {
    let img = Buffer.from(req.file.buffer, 'base64').toString('base64');
    console.log(req.body);

    let data = {
        img: img,
        fname: req.body.firstname.toUpperCase(),
        lname: req.body.lastname.toUpperCase(),
        fathername: req.body.fathername.toUpperCase(),
        id: req.body.id,
        dob: req.body.dateofbirth,
        branch: req.body.branch.toUpperCase(),
        gender: req.body.gender.toUpperCase(),
        course: req.body.course.toUpperCase(),
        address: req.body.address.toUpperCase(),
        city: req.body.city.toUpperCase(),
        validity: req.body.validity.toUpperCase(),
        contact: req.body.contact,
        zip: req.body.zip
    }
    res.render('card', {data})
});

app.get('/', (req, res) => {
    res.render("form")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})