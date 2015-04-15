var Mongoose = require("mongoose"),
    Db = require('../config/db'),
    Config = require("../config/config"),
    request = require("supertest"),
    testCommon = require("./commonHelper"),
    url = Config.server.host + ":" + Config.server.port;

describe("user controller test", function() {
 
  // beforeEach(function(done) {
  //   testCommon.removeCollections(Mongoose, function(error) {
  //     if (error) {
  //       throw error;
  //     }
  //     done();
  //   });
  // });

  describe("Admin registration", function() {

    it("successfully createed admin", function(done) {
      var validAdminRegistraitionData = testCommon.validAdminRegistraitionData();
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error) {
        if (error) {
          console.log(error);
          throw error;
        }
        done();
      });
    });


  }); 

});