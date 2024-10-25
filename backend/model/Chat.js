const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const messageSchema = new Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const chatSchema = new Schema({
    participants: [{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    }],
    messages: [messageSchema]
}, { timestamps: true });

chatSchema.index({ participants: 1 });

chatSchema.pre('save', function (next) {
    this.participants.sort();
    next();
});

const Chat = model('chats', chatSchema);
module.exports = { Chat }