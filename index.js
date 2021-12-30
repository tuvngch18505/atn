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

var multer = require('multer'); //  thu viện multer
var storage = multer.diskStorage({ //storage cau hình image se upload vào đâu
    destination: (req, res, cb) => { // destination khai báo file cuối cùng sẽ đi về đâu lên sever rồi sẽ đi về đâu
        cb(null, 'public/upload') // cb là call back sau khi lên server rồi gọi về callback
    },
    filename: (req, file, cb) => { //filename khi nguoi dung chon ten duoi máy là a khi lên server sẽ là a123
        cb(null, Date.now() + "-" + file.originalname) //file/originalname tránh trùng lặp file với date
    }
})
var upload = multer({ //upload là kt dung lượng file
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true) //mimtype kiem tra những loại ảnh nào được up
        } else {
            return cb(new Error('Only image are allowed'))
        }
    }
})

app.post('/edit', upload.single('myImage'), async(req, res) => {
    let id = req.body.id
    let nameInput = req.body.txtName
    let priceInput = req.body.txtPrice
    let colorInput = req.body.txtColor
    let imageInput = req.file.filename
    let descriptionInput = req.body.txtDescription
    let newValues = {
        $set: { name: nameInput, price: priceInput, color: colorInput, image: imageInput, description: descriptionInput }
    }
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let client = await MongoClient.connect(url);
    let dbo = client.db('atn');
    await dbo.collection('product').updateOne(condition, newValues);
    res.redirect('index');
})

app.get('/edit', async(req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let productToEdit = await dbo.collection("product").findOne(condition, {});
    if (productToEdit.Color == "Pink") {
        const error = 'product is pink not edit';
        res.redirect("edit")
    }
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

    if (nameInput.length <= 4) {
        res.render('create', {
            Error: "Name product must be more than 4 character!!!"
        });
    } else {
        var newValues = { name: nameInput, price: priceInput, color: colorInput, image: imageInput, description: descriptionInput }
        var client = await MongoClient.connect(url)
        var dbo = client.db("atn");
        await dbo.collection("product").insertOne(newValues)
        res.redirect('/index')
    }

})

app.post('/search', async(req, res) => {
    let nameInput = req.body.txtName
    let client = await MongoClient.connect(url)
    let searchCondition = new RegExp(nameInput, 'i')
    let dbo = client.db('atn')
    let results = await dbo.collection("product").find({ name: searchCondition }).toArray();

    if (results.length === 0) {
        res.render('index', { error: `No products were found with the keyword is: ${nameInput}` })
    } else {
        res.render('index', { model: results, count: results.length })
    }
})

app.get('/index', async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let results = await dbo.collection("product").find({}).sort({ _id: 1 }).limit(10).toArray();
    res.render('index', { model: results })
})

app.get('/delete', async(req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    zz
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    await dbo.collection("product").deleteOne(condition);
    res.redirect('index')
})

app.get('/', async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let results = await dbo.collection("product").find({}).sort({ _id: 1 }).limit(10).toArray();
    res.render('indexx', { model: results })
})

app.get('/detail', async(req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let client = await MongoClient.connect(url);
    let dbo = client.db("atn");
    let productToDetail = await dbo.collection("product").findOne(condition, {});
    res.render('detail', { product: productToDetail })

})

const PORT = process.env.PORT || 5000;

app.listen(PORT);

console.log(`Server running at port ${PORT}`);