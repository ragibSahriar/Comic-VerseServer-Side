const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0p8zqx2.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
// ///////////////////


    // Close the MongoDB connection


    const usersCollection = client.db("musicCloud").collection("users");
    const classesCollection = client.db("musicCloud").collection("classes");
    const classesCartCollection = client.db("musicCloud").collection("carts");


    // users related api
    // get student cart collection

app.get("/classCarts",  async (req, res) => {
  const email = req.query.email;

  if (!email) {
    res.send([]);
  }
  const query = { email: email };
  const result = await classesCartCollection.find(query).toArray();
  res.send(result);
});
// Delete  classes from the cart
app.delete("/classesCarts/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await classesCartCollection.deleteOne(query);
  res.send(result);
});
    
    // app.post('/jwt',(req,res)=>{
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
    //     expiresIn: '1h'
    //   })
    //   res.send(token);
    // })

    app.get("/classes", async (req, res) => {
      const query = {};
      const options = {
        sort: {"seats": -1}
      }
      const result = await classesCollection.find(query,options).toArray();
      res.send(result);
    }); 

// classescart student 
    app.get("/classCarts", async (req, res) => {

      const result = await classesCollection.find().toArray();
      res.send(result);
    }); 




    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // delete user

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    // app.get("/role", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const result = await usersCollection.findOne(query);
    //   console.log(result);
    //   res.send(result);
    // });

    app.get("/role", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      console.log(result, query);
      res.send(result);
    });

    // add class 
    app.get("/addClass", async (req, res) => {
      try {
        const result = await classesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error retrieving new classes:", error);
        res.status(500).send("Error retrieving new classes");
      }
    });

    app.get("/addClass", async (req, res) => {
      try {
        // Assuming you have an authentication system that verifies the user's email
        const userEmail = req.query.email;
        if (isValidEmail(userEmail)) {
          const result = await classesCollection.find().toArray();
          res.send(result);
        } else {
          res.status(403).send("Unauthorized access");
        }
      } catch (error) {
        console.error("Error retrieving new classes:", error);
        res.status(500).send("Error retrieving new classes");
      }
    });
    

    app.post("/addClass/feedback/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const feedback = req.body.feedback;
      const updateDoc = {
        $set: {
          feedback: feedback,
        },
      };
      try {
        const result = await classesCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error sending feedback:", error);
        res.status(500).send("Error sending feedback");
      }
    });

    // my class 
    app.get("/addClass/myclass/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await classesCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    // Create a new class
    app.post("/addClass", async (req, res) => {
      const newClass = req.body;
      try {
        const result = await classesCollection.insertOne(newClass);
        res.send(result);
      } catch (error) {
        console.error("Error creating new class:", error);
        res.status(500).send("Error creating new class");
      }
    });
// approvedClasses
    app.patch('/addClass/approved/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: '🟢Approved'
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    app.patch('/addClass/deny/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: '🔴Denied'
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get('/users/role/:email', async (req,res)=>{

    })

    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    //     app.delete('/menu/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await menuCollection.deleteOne(query);
    //   res.send(result);
    // })

// /////////////////////////////////////
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
  res.send("musiccloud server is running");
});

app.listen(port, () => {
  console.log(`musiccloud server is running ${port}`);
});
