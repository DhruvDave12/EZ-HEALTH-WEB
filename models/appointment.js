const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const appointSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    field: {
        type: String,
        required: true,
    },
    extraSymps: {
        type: String,
        required: true,
    },
    patientName: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Appointment', appointSchema);