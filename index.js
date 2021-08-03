const express = require('express');
const exphbs = require('express-handlebars')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = 3000;

async function dbConnection(){
    const url = "mongodb://root:password@localhost:27017";
    const connection = await MongoClient.connect(url);
    const db = connection.db('ToDoList');
    return db.collection('Tasks');
}

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(express.json());

app.get('/tasks', async (request, response) => {
    const collection = await dbConnection();
    const getAllTask = await collection.find({}).toArray();
    response.json(getAllTask);
});

app.post('/tasks',  async (req,res) => {
    const collection = await dbConnection();

    if (!req.body.hasOwnProperty('name')) {
        res.json({
            "success": false
        })
    } else {
        const createOneTask = await collection.insertOne({"name": req.body.name, "completed": "0"});
        res.json({
            "success": createOneTask.acknowledged
        })
    }
});

app.put('/tasks/:id', async (req,res) => {
    const collection = await dbConnection();

    if (!req.params.hasOwnProperty('id') || req.params.id.length < 24) {
        res.json({
            "success": false
        })
    } else {
        const updateTask = await collection.updateOne({"_id":ObjectId(req.params.id)}, {$set:{"completed":"1"}});
        res.json({
            "success": updateTask.modifiedCount === 1
        });
    }
});

app.delete('/tasks/:id', async (req,res) => {
    const collection = await dbConnection();

    if (!req.params.hasOwnProperty('id') || req.params.id.length < 24) {
        res.json({
            "success": false
        })
    } else {
        const deleteTask = await collection.deleteOne({"_id":ObjectId(req.params.id)});
        res.json({
            "success": deleteTask.deletedCount === 1
        });
    }
});

app.listen(port, () => {
    console.log('server running');
});