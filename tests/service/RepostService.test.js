const UserService = require("../../services/UserService");
const PostService = require("../../services/PostService");
const RepostService = require("../../services/RepostService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");

let tab_id_users = [];
let post_id = "";

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

describe("POST - /post", () => {
  it("Création d'un post fictif", (done) => {
    let post = {
      user: tab_id_users[0],
      contentText: "Ceci est un post test",
    };
    PostService.addOnePost(post, null, function (err, value) {
      expect(value).to.haveOwnProperty("_id");
      post_id = value._id;
      done();
    });
  });
});

describe("repost", () => {
  it("Repost d'un post par l'utilisateur connecté - S", (done) => {
    RepostService.repost(users[1]._id, post_id, null, function (err, value) {
      expect(value).to.be.a("object");
      expect(value).to.haveOwnProperty("_id");
      expect(value).to.haveOwnProperty("repost");
      expect(value["repost"]).to.have.lengthOf(1);
      done();
    });
  });
  it("Repost d'un post par l'utilisateur qui l'a créé - E", (done) => {
    RepostService.repost(users[0]._id, post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("Le créateur du post ne peux pas repost");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Repost d'un post incorrect par l'utilisateur connecté - E", (done) => {
    RepostService.repost(
      users[0]._id,
      "741852963",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("ObjectId non conforme.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Repost d'un post inexistant par l'utilisateur connecté - E", (done) => {
    RepostService.repost(
      users[0]._id,
      "66a748cf330b803fb1cfaac3",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Post introuvable.");
        expect(err["type_error"]).to.equal("no-found");
        done();
      }
    );
  });
  it("Repost d'un post par un utilisateur incorrect - E", (done) => {
    RepostService.repost("741852963", post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("ObjectId non conforme.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Repost d'un post par un utilisateur inexistant - E", (done) => {
    RepostService.repost(
      "66ae373660772f1819846f8a",
      post_id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Utilisateur introuvable.");
        expect(err["type_error"]).to.equal("no-found");
        done();
      }
    );
  });
});

describe("cancelrepost", () => {
  it("Disrepost d'un post par l'utilisateur connecté - S", (done) => {
    RepostService.cancelrepost(
      users[1]._id,
      post_id,
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("repost");
        expect(value["repost"]).to.have.lengthOf(0);
        done();
      }
    );
  });
  it("Disrepost d'un post non repost par l'utilisateur connecté - E", (done) => {
    RepostService.cancelrepost(
      users[1]._id,
      post_id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Le post n'est pas repost.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Disrepost d'un post incorrect par l'utilisateur connecté - E", (done) => {
    RepostService.cancelrepost(
      users[1]._id,
      "741852963",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("ID du post invalid.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Disrepost d'un post introuvable par l'utilisateur connecté - E", (done) => {
    RepostService.cancelrepost(
      users[1]._id,
      "66ae373b60772f1819846f8d",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Aucun utilisateur trouvé.");
        expect(err["type_error"]).to.equal("no-found");
        done();
      }
    );
  });
  it("Disrepost d'un post par un utilisateur incorrect - E", (done) => {
    RepostService.cancelrepost(
      "741852963",
      post_id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("ObjectId non conforme.");
        expect(err["type_error"]).to.equal("no-valid");
        done();
      }
    );
  });
  it("Disrepost d'un post par un utilisateur introuvable - E", (done) => {
    RepostService.cancelrepost(
      "66ae373b60772f1819846f8d",
      post_id,
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Utilisateur introuvable.");
        expect(err["type_error"]).to.equal("no-found");
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

describe("DELETE - /post", () => {
  it("Suppression du post fictif", (done) => {
    PostService.deleteOnePost(post_id, null, function (err, value) {
      expect(value).to.haveOwnProperty("_id");
      done();
    });
  });
});
