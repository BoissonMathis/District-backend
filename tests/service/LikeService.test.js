const UserService = require("../../services/UserService");
const PostService = require("../../services/PostService");
const LikeService = require("../../services/LikeService");
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

describe("like", () => {
  it("Like d'un post par l'utilisateur connecté - S", (done) => {
    LikeService.like(users[1]._id, post_id, null, function (err, value) {
      expect(value).to.be.a("object");
      expect(value).to.haveOwnProperty("_id");
      expect(value).to.haveOwnProperty("like");
      expect(value["like"]).to.have.lengthOf(1);
      done();
    });
  });
  it("Like d'un post par l'utilisateur qui l'a créé - E", (done) => {
    LikeService.like(users[0]._id, post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("Le créateur du post ne peux pas like");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Like d'un post incorrect par l'utilisateur connecté - E", (done) => {
    LikeService.like(users[0]._id, "741852963", null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("ObjectId non conforme.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Like d'un post inexistant par l'utilisateur connecté - E", (done) => {
    LikeService.like(
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
  it("Like d'un post par un utilisateur incorrect - E", (done) => {
    LikeService.like("741852963", post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("ObjectId non conforme.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Like d'un post par un utilisateur inexistant - E", (done) => {
    LikeService.like(
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

describe("dislike", () => {
  it("Dislike d'un post par l'utilisateur connecté - S", (done) => {
    LikeService.dislike(users[1]._id, post_id, null, function (err, value) {
      expect(value).to.be.a("object");
      expect(value).to.haveOwnProperty("_id");
      expect(value).to.haveOwnProperty("like");
      expect(value["like"]).to.have.lengthOf(0);
      done();
    });
  });
  it("Dislike d'un post non like par l'utilisateur connecté - E", (done) => {
    LikeService.dislike(users[1]._id, post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("Le post n'est pas like.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Dislike d'un post incorrect par l'utilisateur connecté - E", (done) => {
    LikeService.dislike(users[1]._id, "741852963", null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("ID du post invalid.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Dislike d'un post introuvable par l'utilisateur connecté - E", (done) => {
    LikeService.dislike(
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
  it("Dislike d'un post par un utilisateur incorrect - E", (done) => {
    LikeService.dislike("741852963", post_id, null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["msg"]).to.equal("ObjectId non conforme.");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
  it("Dislike d'un post par un utilisateur introuvable - E", (done) => {
    LikeService.dislike(
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
