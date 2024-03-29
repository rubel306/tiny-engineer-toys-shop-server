const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const products = require("./data/products.json");

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_pass}@cluster0.3cydldd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const categoriesToyCollection = client
      .db("toyDb")
      .collection("categoriesProducts");
    const productsCollection = client.db("toyDb").collection("products");
    const usersProductCollection = client
      .db("toyDb")
      .collection("usersProducts");

    //get categoris toys //for home page
    app.get("/toys", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get one item from the db //for home page
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //add a toy by post method
    app.post("/addToy", async (req, res) => {
      const addToy = req.body;
      const newToy = await usersProductCollection.insertOne(addToy);
      res.send(newToy);
    });

    //get one user product for update page
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersProductCollection.findOne(filter);
      res.send(result);
    });

    //get products based one user email
    app.get("/products", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await usersProductCollection.find(query).toArray();
      res.send(result);
    });

    //put method for update a toy
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToyInfo = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = {
        $set: {
          name: updatedToyInfo.name,
          sellerName: updatedToyInfo.sellerName,
          sellerEmail: updatedToyInfo.sellerEmail,
          subCategory: updatedToyInfo.subCategory,
          price: updatedToyInfo.price,
          rating: updatedToyInfo.rating,
          quantity: updatedToyInfo.quantity,
          description: updatedToyInfo.description,
          image: updatedToyInfo.image,
        },
      };
      const result = await usersProductCollection.updateOne(
        query,
        updateToy,
        options
      );
      res.send(result);
    });

    //delete products
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersProductCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to my Tiny Engineer Shop server");
});

app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});
