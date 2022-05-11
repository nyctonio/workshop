const mongoose = require("mongoose");
require("dotenv").config();
const mongourl = process.env.mongourl;
mongoose.connect(
    mongourl,
    (err) => {
        if (err) {
            console.log("error in connecting to mongoose", err);
            return;
        }
        console.log("connected to mongoose");
    }
);