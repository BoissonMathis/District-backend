const mongoose = require('mongoose')

var EventSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    categorie: String,
    level: String,
    contentText: {
        type: String,
        required: true
    },
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