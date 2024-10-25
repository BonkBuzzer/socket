const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    chats: {
        type: [mongoose.Types.ObjectId],
        ref: 'chats'
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = model('users', userSchema)

module.exports = { User }