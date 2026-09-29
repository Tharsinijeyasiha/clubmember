const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index3.html"));
});

mongoose
    .connect("mongodb://user_454kvcbdu:p454kvcbdu@db01.dbhost.dev:5050/db_454kvcbdu")
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

const buddySchema = new mongoose.Schema({
    buddyId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    tripDuration: {
        type: Number,
        required: true
    },
    interests: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const Buddy = mongoose.model("Buddy", buddySchema);



app.post("/add-buddy", async (req, res) => {
    try {
        const buddy = new Buddy({
            buddyId: req.body.buddyId,
            name: req.body.name,
            destination: req.body.destination,
            age: Number(req.body.age),
            budget: Number(req.body.budget),
            tripDuration: Number(req.body.tripDuration),
            interests: req.body.interests.split(",").map(item => item.trim()),
            status: req.body.status
        });

        await buddy.save();

        res.send(`
            <h2>Travel Buddy Added Successfully!</h2>
            <p>Buddy ID: ${buddy.buddyId}</p>
            <p>Name: ${buddy.name}</p>
            <p>Destination: ${buddy.destination}</p>
            <p>Age: ${buddy.age}</p>
            <p>Budget: ${buddy.budget}</p>
            <p>Trip Duration: ${buddy.tripDuration} days</p>
            <p>Interests: ${buddy.interests.join(", ")}</p>
            <p>Status: ${buddy.status}</p>
            <br>
            <a href="/">Go Back</a>
        `);
    } catch (error) {
        res.send("Error adding buddy: " + error.message);
    }
});


app.get("/insert-sample", async (req, res) => {
    try {
        const buddies = [
            {
                buddyId: "B001",
                name: "Arun",
                destination: "Goa",
                age: 21,
                budget: 15000,
                tripDuration: 4,
                interests: ["Beach", "Photography"],
                status: "Active"
            },
            {
                buddyId: "B002",
                name: "Priya",
                destination: "Manali",
                age: 22,
                budget: 25000,
                tripDuration: 6,
                interests: ["Hiking", "Nature"],
                status: "Active"
            },
            {
                buddyId: "B003",
                name: "Kavin",
                destination: "Goa",
                age: 20,
                budget: 18000,
                tripDuration: 5,
                interests: ["Music", "Beach"],
                status: "Active"
            },
            {
                buddyId: "B004",
                name: "Divya",
                destination: "Ooty",
                age: 23,
                budget: 10000,
                tripDuration: 3,
                interests: ["Nature", "Photography"],
                status: "Active"
            }
        ];

        await Buddy.deleteMany({});
        await Buddy.insertMany(buddies);

        res.send(`
            <h2>4 Travel Buddies Added Successfully!</h2>
            <p>B001 - Arun</p>
            <p>B002 - Priya</p>
            <p>B003 - Kavin</p>
            <p>B004 - Divya</p>
            <br>
            <a href="/">Go Back</a>
        `);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.get("/filter-destination", async (req, res) => {
    try {
        const buddies = await Buddy.find({
            destination: req.query.destination,
            budget: { $gt: Number(req.query.budget) }
        }).select("name destination budget tripDuration -_id");

        res.json(buddies);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.get("/search-buddy", async (req, res) => {
    try {
        const buddy = await Buddy.findOne({
            buddyId: req.query.buddyId
        }).select("name destination budget tripDuration -_id");

        if (!buddy) {
            return res.send("Travel Buddy not found");
        }

        res.json(buddy);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.post("/update-buddy", async (req, res) => {
    try {
        const buddy = await Buddy.findOneAndUpdate(
            { buddyId: req.body.buddyId },
            {
                destination: req.body.destination,
                budget: Number(req.body.budget)
            },
            { new: true }
        ).select("name destination budget tripDuration -_id");

        if (!buddy) {
            return res.send("Travel Buddy not found");
        }

        res.json(buddy);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.post("/increase-budget", async (req, res) => {
    try {
        const result = await Buddy.updateMany(
            { destination: req.body.destination },
            {
                $inc: {
                    budget: Number(req.body.amount)
                }
            }
        );

        res.json({
            message: "Budgets increased successfully",
            modifiedBuddies: result.modifiedCount
        });
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.get("/budget-range", async (req, res) => {
    try {
        const buddies = await Buddy.find({
            budget: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        }).select("name destination budget tripDuration -_id");

        res.json(buddies);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});


app.post("/delete-buddy", async (req, res) => {
    try {
        const result = await Buddy.deleteOne({
            buddyId: req.body.buddyId
        });

        if (result.deletedCount === 0) {
            return res.send("Travel Buddy not found");
        }

        res.send(`
            <h2>Travel Buddy Deleted Successfully!</h2>
            <a href="/">Go Back</a>
        `);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});


app.get("/all-buddies", async (req, res) => {
    try {
        const buddies = await Buddy.find().sort({
            budget: -1
        });

        res.json(buddies);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});



app.listen(3002, () => {
    console.log("Server running on port 3002");
});