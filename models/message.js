var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

// Export model
module.exports = mongoose.model('Message', MessageSchema);