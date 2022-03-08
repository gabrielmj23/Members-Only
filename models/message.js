var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { DateTime } = require('luxon');

var MessageSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

// Virtual for message's formatted timestamp
MessageSchema.virtual('timestamp_formatted').get(function() {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED);
});

// Export model
module.exports = mongoose.model('Message', MessageSchema);