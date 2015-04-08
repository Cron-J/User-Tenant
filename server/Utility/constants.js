'use strict';

var constants = {
    eMailRegex : /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
    phoneRegex : /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i,
    nameRegex : /^[a-zA-Z0-9\s]+$/,
    idRegex : /^[a-zA-Z0-9\s]+$/,
    kDuplicateKeyError : 11000,
    kDuplicateKeyErrorForMongoDBv2_1_1 : 11001,
    successMessage: 'Success'
};
 
exports.constants = constants;

/* phoneRegex matches:

(+351) 282 43 50 50
90191919908
555-8909
001 6867684
001 6867684x1
1 (234) 567-8901
1-234-567-8901 x1234
1-234-567-8901 ext1234
1-234 567.89/01 ext.1234
1(234)5678901x1234
(123)8575973
(0055)(123)8575973

*/