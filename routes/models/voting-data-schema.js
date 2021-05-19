const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');


let votingSchema = new Schema({
   
    email:{
        type: String,
        lowercase: true,
       // required: true,
        unique: true
    },
    vote: {
        type:String,
        required: true
    },
}, {
    timestamps: true
}, {
    versionKey: false
})

module.exports = {
        VotingDetails: mongoose.model('voting_data', votingSchema)
}
