var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { DateTime } = require('luxon');

var UserSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    birthday: {type: Date},
    username: {type: String, required: true},
    password: {type: String, required: true},
    membership: {type: Boolean, required: true},
    admin: {type: Boolean, required: true}
});

// Virtual property for user's full name
UserSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// Virtual for user's formatted birthday
UserSchema.virtual('birthday_formatted').get(function() {
    return DateTime.fromJSDate(this.birthday).toLocaleString(DateTime.DATE_MED);
});

// Virtual for user's birthday for html forms
UserSchema.virtual('birthday_htmlformatted').get(function() {
    return DateTime.fromJSDate(this.birthday).toISODate(DateTime.DATE_SHORT);
});

// Export model
module.exports = mongoose.model('User', UserSchema);