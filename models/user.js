var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    birthday: {type: Date},
    membership: {type: Boolean, required: true},
    admin: {type: Boolean, required: true}
});

// Virtual property for user's full name
UserSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// Virtual for user's profile
UserSchema.virtual('url').get(function() {
    return `/users/${this._id}`;
});

// Export model
module.exports = mongoose.model('User', UserSchema);