const votingModel = require('../voting-data-schema');


module.exports = {

    findVotingData:(emailId) => {
        return new Promise((resolve, reject) => {
            votingModel.VotingDetails.find({email:emailId 
            }, (err, res) => {
                if (err) return err;
                else {
                    console.log(res)
                    resolve(res)
                }
            })
        })
    }
}