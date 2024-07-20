const mongoose = require('mongoose')

var CommentSchema = mongoose.Schema({
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
    response: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    }]
})

module.exports = CommentSchema