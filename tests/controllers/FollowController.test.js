const UserService = require("../../services/UserService");
const FollowService = require("../../services/FollowService");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("./../../server");
let should = chai.should();
const _ = require("lodash");
var tab_id_users = [];
var valid_token = "";

let users = [
  {
    username: "user1",
    email: "user1@gmail.com",
    password: "1234",
    status: "educator",
  },
  {
    username: "user2",
    email: "user2@gmail.com",
    password: "1234",
    status: "coach",
  },
  {
    username: "user3",
    email: "user3@gmail.com",
    password: "1234",
    status: "joueur",
  },
];

describe("POST - /users", () => {
  it("Création des utilisateurs fictif", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
      tab_id_users = _.map(value, "_id");
      console.log(tab_id_users);
      done();
    });
  });
});

describe("POST - /login", () => {
  it("Authentification d'un utilisateur fictif.", (done) => {
    UserService.loginUser("user1", "1234", null, function (err, value) {
      valid_token = value.token;
      done();
    });
  });
});

chai.use(chaiHttp);

// module.exports.unfollow = function (req, res) {
//     req.log.info("Un utilisateur a été unfollow");
//     let unfollow = req.query.unfollow_id;
//     FollowService.unfollow(req.params.id, unfollow, null, function (err, value) {
//       if (err && err.type_error == "no-found") {
//         res.statusCode = 404;
//         res.send(err);
//       } else if (err && err.type_error == "no-valid") {
//         res.statusCode = 405;
//         res.send(err);
//       } else if (err && err.type_error == "error-mongo") {
//         res.statusCode = 500;
//         res.send(err);
//       } else {
//         res.statusCode = 200;
//         res.send(value);
//       }
//     });
//   };

describe("PUT - /follow", () => {
  it("Follow un utilisateur correctement. - S", (done) => {
    chai
      .request(server)
      .put("/follow/" + tab_id_users[0])
      .query({ follow_id: tab_id_users[1].toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe("DELETE - /users", () => {
  it("Suppression des utilisateurs fictif", (done) => {
    UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
      done();
    });
  });
});
