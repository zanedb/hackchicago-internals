const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AttendeeSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  data: String,
  hex: String
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
