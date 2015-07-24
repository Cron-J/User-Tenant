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

exports.sentMailForgotPassword = function(user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>You have requested for "+Config.email.accountName+" account password.</p>"
    +"<p>Here is your account  credentials</p>"
    +"<p><b>User Name :</b> "+user.username+" ,<b>Password :</b> "+crypto.decrypt(user.password)+"</p>"
    +"<p>You can login <a href="+Config.url+"login>here</a></p>"
    mail(from, user.email , "Forgot password", mailbody);
};
exports.sentMailUserDeactivation = function(user, password) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>Your Account has been deactivated.</p>"
    +"<p>If you need any assistance, please contact <b>"+Config.email.accountName+" Team</b>.</p>"
    mail(from, user.email , "jCatalog Account is deactivated", mailbody);
};
exports.sendUserActivationMail = function(user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>Your "+Config.email.accountName+" Account has been activated</p>"
    +"<p>Your account credentials are</p><p><b>username :</b> "+user.username+", <b>password :</b> "+crypto.decrypt(user.password)+"</p>"
    +"<p>You can login <a href="+Config.url+"login>here</a></p>"
    mail(from, user.email , "jCatalog Account is activated", mailbody);
};
exports.sendAccountCreationMail = function(user, tenant) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>Your "+Config.email.accountName+" account has been created.</p>"
    +"<p>As <b>"+user.scope+"</b> for the company <b>"+tenant.name+"</b> you are invited to join.</p>"
    +"<p>Here is your login details.</p>"
    +"<p><b>User Name : </b>"+user.username+" <b>Password : </b>"+crypto.decrypt(user.password)+"</p>"
    +"<p>Please login <a href="+Config.url+"login>here</a></p>"
    mail(from, user.email , "jCatalog Account is created", mailbody);
};
exports.sendAccountCredentialsToUser = function(user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
                    +"<p>Your "+Config.email.accountName+" account credentials are</p><p><b>username :</b> "+user.username+", <b>password :</b> "+crypto.decrypt(user.password)+"</p>"
    
    mail(from, user.email , "jCatalog Account Credential", mailbody);
};
exports.sentUserActivationMailToAdmins = function(list, user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var url = Config.url+"userActivation"+"?"+user._id;
    var mailbody = "<p>Hi Admin,</p>"+
                    "<p>New user is registered. Activate the user by clicking on this <a href="+url+">link</a></p>"
    
    mail(from, list , "User Activation Request", mailbody);
};
exports.sentUserActivationMailToTenantAdmins = function(list, user) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var url = Config.url+"userActivation"+"?userId="+user._id+"&"+user.tenantId;
    var mailbody = "<p>Hi,</p>"+
                    "<p>New user is registered. Activate the user by clicking on this <a href="+url+">link</a></p>"
    
    mail(from, list , "User Activation Request", mailbody);
};
exports.sendVerificationEmail = function(user, tenant, token) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var url = Config.url+Config.email.verifyEmailUrl+"/"+crypto.encrypt(user.username)+"/"+token;
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
    +"<p>Thank you for registering with <b>"+Config.email.accountName+"</b> for <b>"+tenant.name+"</b> company. To complete the registration process please click on this <a href=" + url +">link</a></p>"
    mail(from, user.email , "Email Verification", mailbody);
};

exports.resentMailVerificationLink = function(user,token) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Please verify your email by clicking on the verification link below.<br/><a href='"+Config.url+Config.email.verifyEmailUrl+"?"+crypto.encrypt(user.username)+"&"+token+"'>Verification Link</a></p>"
    mail(from, user.email , "Account Verification", mailbody);
};

exports.accountDeletionMail = function(user, token) {
    var from = Config.email.accountName+" Team<" + Config.email.username + ">";
    var mailbody = "<p>Hi "+user.firstName+" "+user.lastName+", </p><br>"
                    +"<p>Your "+Config.email.accountName+" account for company <b>"+user.tenantId.name+"</b> has been permanently deleted.</p>"
                    +"<p>If you need any further assistance, please contact <b>"+Config.email.accountName+" Team</b>.</p>"
    
    mail(from, user.email , "jCatalog Account has been deleted", mailbody);
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