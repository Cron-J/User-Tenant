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

  describe("POST /user : Admin registration", function() {

    it("successfully created admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
        //console.log(result.request.response.text);
        //console.log(result.request.response);
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

    it("fails to create admin due to invalid userId/useremail type", function(done) {
      var adminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      adminRegistraitionData.userId = "gaurav";
      request(url).post("/user").send(adminRegistraitionData).expect(403).end(function(error, result) {
        if (error) {
          throw error;
        }
        done();
      });
    });
    
  }); 

  describe("POST /tenantSelfRegistration : Tenant registration", function() {

    it("successfully created tenant and it's admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
        done();
      });
    });

    it("fails to create tenant and it's admin due to invalid userId/useremail type", function(done) {
      var tenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      tenantRegistraitionData.user.userId = "gaurav";
      request(url).post("/tenantSelfRegistration").send(tenantRegistraitionData).expect(403).end(function(error, result) {
        if (error) {
          throw error;
        }
        done();
      });
    });

  });

  // describe("POST /tenantUser : Tenant user registration", function() {

  //   it("successfully created tenant used loged in as tenant admin", function(done) {
  //     var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
  //     request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
  //       if (error) {
  //         throw error;
  //       }
       
  //       var validLoginData = {
  //         "userId": validTenantRegistraitionData.user.userId,
  //         "password": validTenantRegistraitionData.user.password
  //       };
  //       request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
  //         if (error) {
  //           throw error;
  //         }
  //         // console.log(result.request.response.body.token);
  //         // console.log(testCommon.validTenantUserData());
  //         // done();
  //         var validTenantUserData = JSON.parse(JSON.stringify(testCommon.validTenantUserData()));
  //         request(url)
  //         .post("/tenantUser")
  //         .set('Authorization', result.request.response.body.token)
  //         // .set('Content-Type',  'application/json')
  //         .send(validTenantUserData)
  //         .expect(200).end(function(error, result) {
  //           if (error) {
  //             console.log(error);
  //             throw error;
  //           }
  //           done();
  //         });
  //       });
  //     }); 
  //   });

  // });

  describe("POST: /login : User Login", function() {

    it("successfull login as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var validLoginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });        
      });
    });
    
    it("login failure due to invalid email with correct email format as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var loginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        loginData.userId = "gaurav@gmail.com"
        request(url).post("/login").send(loginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });        
      });
    });

    it("login failure due to invalid email with incorrect email format as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var loginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        loginData.userId = "gaurav@gmail.com"
        request(url).post("/login").send(loginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });        
      });
    });

    it("login failure due to invalid password as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var loginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        loginData.password = "cronj"
        request(url).post("/login").send(loginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });        
      });
    });

    it("successfull login as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": validTenantRegistraitionData.user.userId,
          "password": validTenantRegistraitionData.user.password
        };
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });
      });     
    });

    it("login failure due to invalid email with correct email format as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": "gaurav@gmail.com",
          "password": validTenantRegistraitionData.user.password
        };
        request(url).post("/login").send(validLoginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });
      });     
    });

    it("login failure due to invalid email with incorrect email format as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": "gaurav",
          "password": validTenantRegistraitionData.user.password
        };
        request(url).post("/login").send(validLoginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });
      });     
    });

    it("login failure due to invalid password as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": validTenantRegistraitionData.user.userId,
          "password": "cronj"
        };
        request(url).post("/login").send(validLoginData).expect(403).end(function(error, result) {
          if (error) {
            throw error;
          }     
          done();
        });
      });     
    });

  });

  describe("GET: /user : Get user details", function() {      

    it("successfull get user detail logged in as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var validLoginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }
          var authorizationHeader = 'Bearer ' + result.request.response.body.token;
          request(url).get("/user")
          .set('Authorization', authorizationHeader)
          .expect(200).end(function(error, result) {
            if (error) {
              throw error;
            }
            done();
          });

        });        
      });
    });
    
    it("unable to get user detail due to invalid token logged in as admin", function(done) {
      var validAdminRegistraitionData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
      request(url).post("/user").send(validAdminRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }

        var validLoginData = JSON.parse(JSON.stringify(testCommon.validAdminRegistraitionData()));
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }
          var authorizationHeader = 'Bearer ' + result.request.response.body.token + 'iiuy';
          request(url).get("/user")
          .set('Authorization', authorizationHeader)
          .expect(401).end(function(error, result) {
            if (error) {
              throw error;
            }
            done();
          });

        });        
      });
    });

    it("successfull get user detail logged in as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": validTenantRegistraitionData.user.userId,
          "password": validTenantRegistraitionData.user.password
        };
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }     
          var authorizationHeader = 'Bearer ' + result.request.response.body.token;
          request(url).get("/user")
          .set('Authorization', authorizationHeader)
          .expect(200).end(function(error, result) {
            if (error) {
              throw error;
            }
            done();
          });
        });
      });     
    });

    it("unable to get user detail due to invalid token logged in as tenant admin", function(done) {
      var validTenantRegistraitionData = JSON.parse(JSON.stringify(testCommon.validTenantRegistraitionData()));
      request(url).post("/tenantSelfRegistration").send(validTenantRegistraitionData).expect(200).end(function(error, result) {
        if (error) {
          throw error;
        }
       
        var validLoginData = {
          "userId": validTenantRegistraitionData.user.userId,
          "password": validTenantRegistraitionData.user.password
        };
        request(url).post("/login").send(validLoginData).expect(200).end(function(error, result) {
          if (error) {
            throw error;
          }     
          var authorizationHeader = 'Bearer ' + result.request.response.body.token + "gy67";
          request(url).get("/user")
          .set('Authorization', authorizationHeader)
          .expect(401).end(function(error, result) {
            if (error) {
              throw error;
            }
            done();
          });
        });
      });     
    });

  });
});