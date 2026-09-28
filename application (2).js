const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Open index2.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index2.html"));
});

// MongoDB Connection
mongoose
    .connect("mongodb://user_454kvcbdu:p454kvcbdu@db01.dbhost.dev:5050/db_454kvcbdu")
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

// Mongoose Schema
const memberSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    clubName: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    points: {
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

const Member = mongoose.model("Member", memberSchema);


// ==================================================
// 1. ADD CLUB MEMBER
// ==================================================

app.post("/add-member", async (req, res) => {
    try {

        const member = new Member({
            memberId: req.body.memberId,
            name: req.body.name,
            clubName: req.body.clubName,
            yearOfStudy: Number(req.body.yearOfStudy),
            role: req.body.role,
            points: Number(req.body.points),

            interests: req.body.interests
                .split(",")
                .map(item => item.trim()),

            status: req.body.status
        });

        await member.save();

        res.send(`
            <h2>Club Member Added Successfully!</h2>

            <p>Member ID: ${member.memberId}</p>
            <p>Name: ${member.name}</p>
            <p>Club Name: ${member.clubName}</p>
            <p>Year of Study: ${member.yearOfStudy}</p>
            <p>Role: ${member.role}</p>
            <p>Points: ${member.points}</p>
            <p>Interests: ${member.interests.join(", ")}</p>
            <p>Status: ${member.status}</p>

            <br>
            <a href="/">Go Back</a>
        `);

    } catch (error) {
        res.send("Error adding member: " + error.message);
    }
});


// ==================================================
// 2. INSERT 4 SAMPLE MEMBERS
// ==================================================

app.get("/insert-sample", async (req, res) => {
    try {

        const members = [
            {
                memberId: "M001",
                name: "Arun",
                clubName: "Coding Club",
                yearOfStudy: 2,
                role: "Member",
                points: 85,
                interests: ["Coding", "AI"],
                status: "Active"
            },

            {
                memberId: "M002",
                name: "Priya",
                clubName: "Coding Club",
                yearOfStudy: 3,
                role: "Coordinator",
                points: 120,
                interests: ["Web Development", "AI"],
                status: "Active"
            },

            {
                memberId: "M003",
                name: "Kavin",
                clubName: "Music Club",
                yearOfStudy: 1,
                role: "Member",
                points: 70,
                interests: ["Music", "Singing"],
                status: "Active"
            },

            {
                memberId: "M004",
                name: "Divya",
                clubName: "Dance Club",
                yearOfStudy: 2,
                role: "Leader",
                points: 150,
                interests: ["Dance", "Fitness"],
                status: "Active"
            }
        ];

        await Member.deleteMany({});

        await Member.insertMany(members);

        res.send(`
            <h2>4 Club Members Added Successfully!</h2>
            <p>M001 - Arun</p>
            <p>M002 - Priya</p>
            <p>M003 - Kavin</p>
            <p>M004 - Divya</p>

            <br>
            <a href="/">Go Back</a>
        `);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 3. CLUB + POINTS FILTER
// ==================================================

app.get("/filter-club", async (req, res) => {
    try {

        const members = await Member.find({
            clubName: req.query.clubName,
            points: {
                $gt: Number(req.query.points)
            }
        }).select("name clubName role points -_id");

        res.json(members);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 4. SEARCH MEMBER BY MEMBER ID
// ==================================================

app.get("/search-member", async (req, res) => {
    try {

        const member = await Member.findOne({
            memberId: req.query.memberId
        }).select("name clubName role points -_id");

        if (!member) {
            return res.send("Member not found");
        }

        res.json(member);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 5. UPDATE ROLE AND POINTS
// ==================================================

app.post("/update-member", async (req, res) => {
    try {

        const member = await Member.findOneAndUpdate(
            {
                memberId: req.body.memberId
            },
            {
                role: req.body.role,
                points: Number(req.body.points)
            },
            {
                new: true
            }
        ).select("name clubName role points -_id");

        if (!member) {
            return res.send("Member not found");
        }

        res.json(member);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 6. INCREASE POINTS OF ALL MEMBERS IN A CLUB
// ==================================================

app.post("/increase-points", async (req, res) => {
    try {

        const result = await Member.updateMany(
            {
                clubName: req.body.clubName
            },
            {
                $inc: {
                    points: Number(req.body.points)
                }
            }
        );

        res.json({
            message: "Points increased successfully",
            modifiedMembers: result.modifiedCount
        });

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 7. SEARCH MEMBERS WITHIN POINTS RANGE
// ==================================================

app.get("/points-range", async (req, res) => {
    try {

        const members = await Member.find({
            points: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        }).select("name clubName role points -_id");

        res.json(members);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 8. DELETE MEMBER USING MEMBER ID
// ==================================================

app.post("/delete-member", async (req, res) => {
    try {

        const result = await Member.deleteOne({
            memberId: req.body.memberId
        });

        if (result.deletedCount === 0) {
            return res.send("Member not found");
        }

        res.send(`
            <h2>Member Deleted Successfully!</h2>
            <a href="/">Go Back</a>
        `);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// 9. DISPLAY ALL MEMBERS
//    DESCENDING ORDER OF POINTS
// ==================================================

app.get("/all-members", async (req, res) => {
    try {

        const members = await Member.find()
            .sort({
                points: -1
            });

        res.json(members);

    } catch (error) {
        res.send("Error: " + error.message);
    }
});


// ==================================================
// START SERVER
// ==================================================

app.listen(3001, () => {
    console.log("Server running on port 3001");
});