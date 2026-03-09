const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    candidate_name: { type: String, required: true },
    college_name: { type: String, required: true },
    date: { type: String },
    place: { type: String },
    region: { type: String },
    contact_number: { type: String },
    email_id: { type: String },
    date_of_drive: { type: String },
    drive_status: { type: String },
    round_1_person: { type: String },
    round_2_person: { type: String },
    comments: { type: String },
    training_period_date: { type: String },
    resume: { type: String }, // Base64
    offer_letter: { type: String } // Base64
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);
