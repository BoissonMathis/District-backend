const FeedService = require("../../services/FeedService");
const UserService = require("../../services/UserService");
const PostService = require("../../services/PostService");
const FollowService = require("../../services/FollowService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");

let tab_id_users = [];
let posts_id = [];

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

describe("POST - /posts", () => {
  it("Création des posts fictif", (done) => {
    let posts = [
      {
        user: tab_id_users[1],
        contentText: "Ceci est un post test",
      },
      {
        user: tab_id_users[2],
        contentText: "Ceci est un deuxieme post test",
      },
      {
        user: tab_id_users[1],
        contentText: "Ceci est un troisieme post test",
      },
      {
        user: tab_id_users[2],
        contentText: "Ceci est un quatrieme post test",
      },
    ];
    PostService.addManyPosts(posts, null, function (err, value) {
      expect(value).to.have.lengthOf(4);
      posts_id = _.map(value, "_id");
      done();
    });
  });
});

describe("follow", () => {
  it("Follow d'un utilisateur - S", (done) => {
    FollowService.follow(
      tab_id_users[0],
      tab_id_users[1],
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
  it("Follow d'un utilisateur - S", (done) => {
    FollowService.follow(
      tab_id_users[0],
      tab_id_users[2],
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("follows");
        expect(value["follows"]).to.have.lengthOf(2);
        done();
      }
    );
  });
});

describe("GET - /feed", () => {
  it("Récupérer le feed de l'utilisateur connecté correctement - S", (done) => {
    FeedService.getUserConnectedFeed(
      tab_id_users[0],
      { populate: true },
      function (err, value) {
        expect(value).to.haveOwnProperty("posts");
        expect(value["posts"]).to.have.lengthOf(4);
        expect(value).to.haveOwnProperty("count");
        expect(value["count"]).to.be.equal(4);
        done();
      }
    );
  });
  it("Récupérer le feed de l'utilisateur connecté correctement qui ne suit perdsonne - S", (done) => {
    FeedService.getUserConnectedFeed(
      tab_id_users[1],
      { populate: true },
      function (err, value) {
        expect(value).to.haveOwnProperty("posts");
        expect(value["posts"]).to.have.lengthOf(0);
        expect(value).to.haveOwnProperty("count");
        expect(value["count"]).to.be.equal(0);
        done();
      }
    );
  });
  it("Récupérer le feed d'un utilisateur inexistant - E", (done) => {
    FeedService.getUserConnectedFeed(
      "66a748cf330b803fb1cfaac3",
      { populate: true },
      function (err, value) {
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("Aucun utilisateur trouvé.");
        expect(err["type_error"]).to.equal("no-found");
        done();
      }
    );
  });
  it("Récupérer le feed d'un utilisateur avec id incorrect - E", (done) => {
    FeedService.getUserConnectedFeed(
      "741852963",
      { populate: true },
      function (err, value) {
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["msg"]).to.equal("ObjectId non conforme.");
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

describe("DELETE - /posts", () => {
  it("Suppression des posts fictif", (done) => {
    PostService.deleteManyPosts(posts_id, null, function (err, value) {
      expect(value).to.haveOwnProperty("deletedCount");
      expect(value["deletedCount"]).to.equal(posts_id.length);
      done();
    });
  });
});
