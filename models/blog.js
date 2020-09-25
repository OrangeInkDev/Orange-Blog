var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "none"},
    content: String,
    author: {
       id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
       },
       username: String
    },
    created_at: {type: Date, default: Date.now}

 });

module.exports = mongoose.model("Blog", blogSchema);