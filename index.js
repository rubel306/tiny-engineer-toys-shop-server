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

    //get local products
    // app.get("/products", async (req, res) => {
    //   const cursor = productsCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    // app.get("/products/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await categoriesToyCollection.findOne(query);
    //   res.send(result);
    //   console.log(id);
    // });

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
