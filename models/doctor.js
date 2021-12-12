const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const docSchema = new Schema({
    
    gender: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    post: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    hospitalADD: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    }, 
    country: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    field: {
        type: String,
        required: true,
    },
    hospitalName: {
        type: String,
        required: true,
    }
})

docSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Doctor', docSchema);