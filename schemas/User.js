const mongoose = require('mongoose')

const format =  {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
}

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    bio : {
        type: String,
        default: ''
    },
    profil_image: {
        type: String,
        default: 'https://journalmetro.com/wp-content/uploads/2017/04/default_profile_400x400.png?resize=400%2C400?fit=160%2C160'
    },
    banner_image: {
        type: String,
        default: 'https://journalmetro.com/wp-content/uploads/2017/04/default_profile_400x400.png?resize=400%2C400?fit=160%2C160'
    },
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    created_at: {
        type: String,
        default: new Date().toLocaleString('fr-FR').split(" ").join("-")
    },
    token: String
})

module.exports = UserSchema