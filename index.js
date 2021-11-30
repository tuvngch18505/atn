var express = require('express');
var app = express();
app.set('view engine', 'hbs');
var hbs = require('hbs');

app.use(express.static(__dirname + '/public'));

//bodyParser

var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))

var url = 'mongodb+srv://bboyfinger:bboyfinger123@cluster0.q601u.mongodb.net/atn';
var MongoClient = require('mongodb').MongoClient;

hbs.registerHelper('add', (index) => {
        index++;
        return index;
    })
    //multer

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'public/upload')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed'))
        }
    }
})

app.post('/edit', async(req, res) => {
    let id = req.body.id
    let nameInput = req.body.txtName
    let priceInput = req.body.txtPrice
    let colorInput = req.body.txtColor
    let descriptionInput = req.body.txtDescription
    let newValues = {
        $set: { name: nameInput, price: priceInput, color: colorInput, description: descriptionInput }
    }
    var ObjectID = require('mongodb').ObjectID
    let condition = { "_id": ObjectID(id) }
    let client = await MongoClient.connect(url)
    let dbo = client.db('atn')
    await dbo.collection('product').updateOne(condition, newValues)
    res.redirect('index')
})

app.get('/edit', async(req, res) => {
    let id = req.query.id;

    var ObjectID = require('mongodb').ObjectID;

    let condition = { "_id": ObjectID(id) };

    let client = await MongoClient.connect(url);

    let dbo = client.db("atn");

    let productToEdit = await dbo.collection("product").findOne(condition, {});

    res.render('edit', { product: productToEdit })
})

app.get("/create", (req, res) => {
    res.render('create')
})

app.post('/create', upload.single('myImage'), async(req, res) => {
    var nameInput = req.body.txtName
    var priceInput = req.body.txtPrice
    var colorInput = req.body.txtColor
    var descriptionInput = req.body.txtDescription
    var imageInput = req.file.filename
    var newValues = { name: nameInput, price: priceInput, color: colorInput, image: imageInput, description: descriptionInput }
    var client = await MongoClient.connect(url)
    var dbo = client.db("atn");
    await dbo.collection("product").insertOne(newValues)
    res.redirect('/index')
})

app.get('/index', async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let results = await dbo.collection("product").find({}).toArray();
    res.render('index', { model: results })
})

app.get('/delete', async(req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    await dbo.collection("product").deleteOne(condition);
    res.redirect('index')
})

app.get('/', async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let results = await dbo.collection("product").find({}).toArray();
    res.render('indexx', { model: results })
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.listen(process.env.port || 5000);
console.log('Web server is listening at port ' + (process.env.port || 3000));