const votingModel = require('./models/voting-data-schema'),
    votingServices = require('./models/services/customerServices'),
    loginModel = require('./models/login-model-schemas'),
    jwt = require('jsonwebtoken'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    refreshTokens = [],
    _ = require('lodash');



module.exports = (app) => {

    //login page

    app.get('/login', (req, res) => {

        res.render('login.ejs', { Message: 'Login page' });
    })


    //Handling user logout 
    app.get('/logout', (req, res) => {
        res.clearCookie('nToken');
        res.redirect('/login');
    });

    //login 
    app.post('/login', async (req, res) => {

        let { email, password } = req.body;

        if (email && password) {
            let user = await loginModel.LoginDetails.find({
                email: email
            }, (err, result) => {
                if (err) {
                    return 'error';
                } else if (result.length === 0) {
                    return res.render('login.ejs', { Message: 'Username or Password incorrect' });
                }
                else if (result.length === 1) {
                    return result.email === email && result.password === password
                }
            })
            if (user.length === 1) {

                let accessToken = jwt.sign({ email: user.email }, process.env.ACCESSTOKENKEY, {
                    expiresIn: "3h"
                });

                const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESHTOKENSECRET);

                refreshTokens.push(refreshToken);

                if (user[0].role === 'admin') {
                    votingModel.VotingDetails.aggregate([{ $group: { "_id": "$vote", "count": { "$sum": 1 } } }], (err, result) => {
                        if (err) return err; {
                            return res.render("admin.ejs", { result: result })
                        }

                    })
                } else if (user[0].role === 'user') {
                    return res.render("index.ejs", { email: user[0].email, Message: 'Vote for your favourite person' })
                }
            }

        } else {
            return res.render("index.ejs", { email: user[0].email, Message: 'Both email and password are required' })
        }


    });

    // register form

    app.get('/register', (req, res) => {
        res.render('register.ejs', { Message: 'Register Form' });
    })

    // register 

    app.post('/register', async function (req, res) {
        console.log("req.body")
        let userData = {
            name: req.body.name,
            password: req.body.password,
            confirm_pwd: req.body.confirm_password,
            email: req.body.email,
            role: req.body.role,
        }


        loginModel.LoginDetails.findOne({ email: userData.email }, (err, response) => {
            if (err) return err;
            else {
                if (response && response.email === userData.email) {
                    res.render('register.ejs', { Message: 'This email is already registered' });
                } else {
                    let randomToken = crypto.randomBytes(20);
                    let intitialId = crypto.createHash('sha1').update(randomToken + 'userId').digest('hex');
                    if (userData.name && userData.email && userData.password && userData.confirm_pwd) {
                        if (userData.password !== userData.confirm_pwd) {
                            res.render('register.ejs', { Message: 'Passwords do not match.' });
                        } else {
                            bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
                                if (err) return res.status(400).json({ message: 'Error Hashing!' });
                                else {
                                    loginModel.LoginDetails.create(userData, (err, user) => {
                                        if (err) return err;
                                        else {
                                            res.render('login.ejs', { Message: 'successfully created please login.' });
                                        }
                                    })

                                }
                            })
                        }
                    } else {

                        res.render('register.ejs', { Message: 'All fields required.' });

                    }
                }
            }
        })
    });


    // save voting data

    app.get('/save', async (req, res) => {

        let userInfo = await req.query.subject.split('$');

        let votingData = {
            vote: userInfo[0],
            email: userInfo[1]
        }

        let checkUser = await votingServices.findVotingData(userInfo[1]);

        if (checkUser.length === 0) {
            votingModel.VotingDetails.create(votingData, (err, user) => {
                if (err) {
                    return 'error';
                } else {
                    res.render('index.ejs', { email: userInfo[1], Message: "Successfully Voted." })
                }
            })

        } else {
            res.render('index.ejs', { email: userInfo[1], Message: "already voted." })

        }


    })

}