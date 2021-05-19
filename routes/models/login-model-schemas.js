const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');


let loginSchema = new Schema({
    name: {
        type:String,
        required: true
    },
    email:{
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    role: {
        type:String,
        required: true
    },
    confirm_pwd:{
        type:String,
        required: true
    },
}, {
    timestamps: true
}, {
    versionKey: false
})

module.exports = {
    LoginDetails: mongoose.model('login_data', loginSchema)
}
