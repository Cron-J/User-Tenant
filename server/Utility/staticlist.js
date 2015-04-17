var countries = require('country-list')();

exports.getCountryList = {
    handler: function(request, reply) {
         return reply(countries.getData());
    }
};