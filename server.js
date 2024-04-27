const express = require('express');
const fileUpload = require('express-fileupload');
const readExcelFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');  // Import ObjectId
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('public')); // Serves static files from 'public' directory
app.use(fileUpload());
// Middleware to parse JSON bodies
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true }); // Ensure the uploads directory exists

const uri = mongodb+srv://laurenwong1207:1W3u0MgzYvHpRMSA@cluster0.jtgfwcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    const db = client.db("visualize"); // Adjust to your actual database name
    const collection = db.collection("visualizeC");

    app.post('/upload', async (req, res) => {
          if (!req.files || !req.files.excelFile) {
              return res.status(400).send('No files were uploaded.');
          }
          const collection = client.db("visualize").collection("visualizeC");
          await collection.deleteMany({}); // Clear the collection first
      
          const excelFile = req.files.excelFile;
          const filePath = path.join(uploadsDir, excelFile.name);
          const collectionName = 'collection_' + Date.now(); // Create a unique collection name
          excelFile.mv(filePath, async function(err) {
            if (err) return res.status(500).send('Error moving file: ' + err.message);
        
            try {
                const rows = await readExcelFile(filePath, { header: true });
                console.log("Parsed rows before insertion:", JSON.stringify(rows, null, 2));
        
                // Applying one of the above transformations
                const transformedRows = rows.map(row => ({
                    _id: new ObjectId(),  // MongoDB ObjectId for each new document
                    Type: row[0] || "default type",  // Set a default type if null
                    data: row[1] || "default data"  // Provide default data if null
                }));
        
                await collection.insertMany(transformedRows);
                res.send('File uploaded and data inserted into MongoDB!');
            } catch (e) {
                console.error('Error reading Excel file or inserting data:', e);
                res.status(500).send('Failed to read Excel file or insert data: ' + e.message);
            }
        });
        
      });
  
    app.post('/add-data', async (req, res) => {
      console.log(req.body); // Log to see what the server is receiving
        try {
            //const { Type, Data } = req.body;
            const collection = client.db("visualize").collection("visualizeC");
    
            await collection.insertOne({_id:new ObjectId(),Type:req.body.Type, data:req.body.Data });
            res.status(201).send('Data added');
        } catch (error) {
            console.error('Failed to add data:', error);
            res.status(500).send('Error adding data');
        }
    });
    
    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/public/index.html');
    });

    // Fetch all documents from the collection
    app.get('/data', async (req, res) => {
      try {
          const collection = client.db("visualize").collection("visualizeC");
          const documents = await collection.find({}).toArray();
          res.json(documents);
      } catch (error) {
          console.error('Failed to fetch data:', error);
          res.status(500).send('Error fetching data');
      }
    });
    // Delete a document by _id
    app.delete('/data/:id', async (req, res) => {
      try {
          const collection = client.db("visualize").collection("visualizeC");
          const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) }); // Correctly convert string to ObjectId
  
          if(result.deletedCount === 1) {
              res.send('Document deleted');
          } else {
              res.status(404).send('Document not found'); // If no document is found with the given _id
          }
      } catch (error) {
          console.error('Failed to delete data:', error);
          res.status(500).send('Error deleting data');
      }
  });

    // Update a document
    app.put('/data/:id', async (req, res) => {
      try {
          const collection = client.db("visualize").collection("visualizeC");
          const updateResult = await collection.updateOne(
              { _id: new MongoClient.ObjectId(req.params.id) },
              { $set: req.body }
          );
          if (updateResult.modifiedCount === 1) {
              res.send('Document updated');
          } else {
              res.send('No changes made to the document');
          }
      } catch (error) {
          console.error('Failed to update data:', error);
          res.status(500).send('Error updating data');
      }
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Remove the client.close from here
  } catch (e) {
    console.error('Error during MongoDB connection or server setup:', e);
  }
}

run().catch(console.dir);
