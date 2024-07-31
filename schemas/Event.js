const mongoose = require('mongoose')

var EventSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    categorie: [{
        type: String,
    }],
    contentText: [{
        type: String,
    }],
    place: String,
    candidate: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
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
    updated_at: String
})

module.exports = EventSchema