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
  it("Follow un utilisateur déja follow. - E", (done) => {
    chai
      .request(server)
      .put("/follow/" + tab_id_users[0])
      .query({ follow_id: tab_id_users[1].toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Follow un utilisateur qui n'existe pas. - E", (done) => {
    chai
      .request(server)
      .put("/follow/" + tab_id_users[0])
      .query({ follow_id: "66a2bfe9c6586ef77eef101c" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it("Follow un utilisateur avec id incorrect. - E", (done) => {
    chai
      .request(server)
      .put("/follow/" + tab_id_users[0])
      .query({ follow_id: "741852963" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
});

describe("DELETE - /unfollow", () => {
  it("Unfollow un utilisateur correctement. - S", (done) => {
    chai
      .request(server)
      .delete("/unfollow/" + tab_id_users[0])
      .query({ unfollow_id: tab_id_users[1].toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("Unfollow un utilisateur que l'on ne follow pas. - E", (done) => {
    chai
      .request(server)
      .delete("/unfollow/" + tab_id_users[0])
      .query({ follow_id: tab_id_users[1].toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Unfollow un utilisateur qui n'existe pas. - E", (done) => {
    chai
      .request(server)
      .delete("/unfollow/" + tab_id_users[0])
      .query({ follow_id: "66a2bfe9c6586ef77eef101c" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Unfollow un utilisateur avec id incorrect. - E", (done) => {
    chai
      .request(server)
      .delete("/unfollow/" + tab_id_users[0])
      .query({ follow_id: "741852963" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
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
