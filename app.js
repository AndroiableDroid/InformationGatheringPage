const express = require('express')
const path = require("path")
var QRCode = require('qrcode')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express();
const port = process.env.PORT || 3000

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/"));
const FC = require('./modules/face-crop');

app.post('/print', upload.single('picture'), function (req, res, next) {
    let img = Buffer.from(req.file.buffer, 'base64');
    let size = req.file.size / 1000;
    if (size > 1024) {
        res.send(
            {
                img: "Error Image too large (>1 MB)"
            }
        )
        return;
    }
    FC({
        src: img,
        dst: {
            width: 1000,
            height: 1000
        },
        outImage: false,
        scale: 2
    }).then(data => {
        // console.log(data)
        img = data;
    }).catch(e => {
        console.log(e);
        // alert("Hello");
    });
    const formatDate = (data) => {
        let date = data.split('-');
        return date[2] + '.' + date[1] + '.' + date[0];
    }

    let data = {
        fname: req.body.firstname.toUpperCase(),
        lname: req.body.lastname.toUpperCase(),
        fathername: req.body.fathername.toUpperCase(),
        id: req.body.id.toUpperCase(),
        dob: formatDate(req.body.dateofbirth),
        batch: req.body.batch,
        branch: req.body.branch.toUpperCase(),
        gender: req.body.gender.toUpperCase(),
        address: req.body.address.toUpperCase(),
        city: req.body.city.toUpperCase(),
        contact: req.body.contact,
        zip: req.body.zip
    }
    QRCode.toDataURL(JSON.stringify(data), function (err, url) {
        data['qr'] = url.substring(22);
        data['img'] = img;
        res.render('card', {data})
    })
});

app.get('/', (req, res) => {
    res.render("form")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app;
