const mongoose = require('mongoose')

var PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentText: {
        type: String,
        required: true
    },
    contentImage: {
        type: String
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    repost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    }]
})

module.exports = PostSchema