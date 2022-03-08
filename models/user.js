var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { DateTime } = require('luxon');

var UserSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    membership: {type: Boolean, required: true},
    admin: {type: Boolean, required: true}
});

// Virtual property for user's full name
UserSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// Export model
module.exports = mongoose.model('User', UserSchema);