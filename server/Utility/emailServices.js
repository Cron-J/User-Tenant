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

exports.sentMailForgotPassword = function(email, username, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Your "+Config.email.accountName+"  Account Credential</p><p>username : "+username+" , password : "+crypto.decrypt(password)+"</p>"
    mail(from, email , "Forgot password", mailbody);
};
exports.sentMailUserDeactivation = function(username, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Your Account has been deactivated</p>"+
    "<p>Please contact admin for access</p>"
    mail(from, username , "Account Credential", mailbody);
};
exports.sentMailUserActivation = function(username, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Your Account has been activated</p>"+
    "<p>Your "+Config.email.accountName+"  Account Credentials </p><p>username : "+username+" , password : "+crypto.decrypt(password)+"</p>"
    mail(from, username , "Account Credential", mailbody);
};
exports.sentUserActivationMailToAdmins = function(list, user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi Admin,</p>"+
                    "<p>New user is registered. Activate the user by clicking on this link<a href="+crypto.encrypt(user._id)+"</p>"
    
    mail(from, list , "Account Credential", mailbody);
};
exports.sendVerificationEmail = function(user, token) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var url = Config.url+Config.email.verifyEmailUrl+"/"+crypto.encrypt(user.username)+"/"+token;
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>Thanks for registering with us!</p>"
    +"<p>Please verify your email by clicking on <a href=" + url +">this link</a></p>"
    mail(from, user.email , "Account Credential", mailbody);
};
exports.resentMailVerificationLink = function(user,token) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Please verify your email by clicking on the verification link below.<br/><a href='"+Config.url+Config.email.verifyEmailUrl+"?"+crypto.encrypt(user.username)+"&"+token+"'>Verification Link</a></p>"
    mail(from, user.email , "Account Verification", mailbody);
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