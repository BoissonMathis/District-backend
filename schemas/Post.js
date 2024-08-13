const mongoose = require('mongoose')

var PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
        ref: 'User'
    }],
    repost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    created_by: {
        type: String,
        required: true,
        default: function() {
            return this._id ? this._id.toString() : null;
        }
    },
    created_at: {
        type: String,
        default: new Date()
    },
    updated_at: String,
})

module.exports = PostSchema