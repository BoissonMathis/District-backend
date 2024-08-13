const FollowService = require("../../services/FollowService");
const UserService = require("../../services/UserService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");

let tab_id_users = [];

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
  it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
      tab_id_users = _.map(value, "_id");
      users = value;
      done();
    });
  });
});

describe("follow", () => {
  it("Follow d'un utilisateur - S", (done) => {
    FollowService.follow(
      users[0]._id,
      users[1]._id,
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("follows");
        expect(value["follows"]).to.have.lengthOf(1);
        done();
      }
    );
  });
  it("Follow d'un utilisateur déja follow - E", (done) => {
    FollowService.follow(
      users[0]._id,
      users[1]._id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Utilisateur déjà follow.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Follow d'un utilisateur inexistant - E", (done) => {
    FollowService.follow(
      users[0]._id,
      "66b6239694356025287e71a0",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("L'utilisateur à suivre n'existe pas.");
        expect(err["type_error"]).to.equal("no-found");
        done();
      }
    );
  });
  it("Follow d'un utilisateur incorrect - E", (done) => {
    FollowService.follow(
      users[0]._id,
      "7410852963",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Erreur lors de la mise à jour.");
        expect(err["type_error"]).to.equal("error-mongo");
        done();
      }
    );
  });
});

describe("unfollow", () => {
  it("Unfollow d'un utilisateur - S", (done) => {
    FollowService.unfollow(
      users[0]._id,
      users[1]._id,
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("follows");
        expect(value["follows"]).to.have.lengthOf(0);
        done();
      }
    );
  });
  it("Unfollow d'un utilisateur non follow - E", (done) => {
    FollowService.unfollow(
      users[0]._id,
      users[1]._id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("L'utilisateur n'est pas suivi.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Unfollow d'un utilisateur inexistant - E", (done) => {
    FollowService.unfollow(
      users[0]._id,
      "66b6239694356025287e71a0",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("L'utilisateur n'est pas suivi.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Unfollow d'un utilisateur incorrect - E", (done) => {
    FollowService.unfollow(
      users[0]._id,
      "7410852963",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal(
          "L'ID de l'utilisateur à unfollow n'est pas valide."
        );
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
});

describe("DELETE - /users", () => {
  it("Suppression des utilisateurs fictif", (done) => {
    UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
      done();
    });
  });
});
