var Mongoose = require("mongoose"),
    Config = require("../config/config"),
    request = require("supertest"),
    testCommon = require("./commonHelper"),
    url = Config.server.host + ":" + Config.server.port;

describe("user controller test", function() {
 
  before(function(done) {
      Mongoose.connect(Config.database.url);
      db = Mongoose.connection;
      db.on('error', console.error.bind(console, 'DB connection error'));
      db.once('open', function callback() {
          done();
      });
  });

  after(function(done) {
      Mongoose.connection.close(done);
  });

  beforeEach(function(done) {
    testCommon.removeCollections(Mongoose, function(error) {
      if (error) {
        throw error;
      }
      done();
    });
  });

  describe("Admin registration", function() {

    it("successfully created admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
        done();
      });
    });

    it("fails to create admin while trying to create another admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
        request(url).post("/user").send(validAdminRegistraitionData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }
          done();
        });
      });
    });
    
  }); 

});