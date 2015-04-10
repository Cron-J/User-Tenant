'use strict';

var nodemailer = require("nodemailer"),
    Config = require('../config/config'),
    crypto = require('./cryptolib'),
    algorithm = 'aes-256-ctr';

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: Config.email.username,
        pass: Config.email.password
    }
});

exports.sentMailForgotPassword = function(username, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Your "+Config.email.accountName+"  Account Credential</p><p>username : "+username+" , password : "+crypto.decrypt(password)+"</p>"
    mail(from, username , "Forgot password", mailbody);
};

exports.sentMailUserCreation = function(username, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Your "+Config.email.accountName+"  Account Credential</p><p>username : "+username+" , password : "+crypto.decrypt(password)+"</p>"
    mail(from, username , "Account Credential", mailbody);
};




function mail(from, email, subject, mailbody){
    var mailOptions = {
        from: from, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        //text: result.price, // plaintext body
        html: mailbody  // html body
    };

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.error(error);
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}