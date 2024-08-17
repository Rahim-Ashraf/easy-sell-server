const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// middlewars
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://easy-sell-304cc.web.app",
      "https://easy-sell-304cc.firebaseapp.com",
    ],
    credentials: true,
  })
);


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.drgen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const easy_sell = client.db("easy_sell");
    const productsCollection = easy_sell.collection("products");

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result)
    })
    app.get("/single-page-products", async (req, res) => {
      const skip = req.query.skip;
      const result = await productsCollection.find().limit(12).skip(parseInt(skip)).toArray();
      res.send(result)
    })
    app.get("/products-by-name", async (req, res) => {
      const text = req.query.text
      const query = { name: { $regex: text, $options: 'i' } };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    })
    app.get("/filterd-products", async (req, res) => {
      const body = req.query;
      const brandName = body.brandName;
      const category = body.categoryName;
      const minPrice = parseFloat(body.minPrice) || 0;
      const maxPrice = parseFloat(body.maxPrice) || Number.MAX_SAFE_INTEGER;
      if (!brandName && !category) {
        const query = {
          price: {
            $gte: minPrice,
            $lte: maxPrice
          }
        };
        const result = await productsCollection.find(query).toArray();
        res.send(result);
        return;
      } else if (brandName || category || minPrice || parseFloat(body.maxPrice)) {
        const query = {
          $and: [
            {
              $or: [
                { brand_name: brandName },
                { category_name: category },
              ]
            },
            {
              price: {
                $gte: minPrice,
                $lte: maxPrice
              }
            }
          ]
        };
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      }
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Easy Sell is Running")
})

app.listen(PORT, () => {
  console.log(`server is Running at http://localhost:${PORT}`)
})