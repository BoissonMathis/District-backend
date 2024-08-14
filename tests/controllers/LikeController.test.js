const UserService = require("../../services/UserService");
const PostService = require("../../services/PostService");
const LikeService = require("../../services/LikeService");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("./../../server");
let should = chai.should();
const _ = require("lodash");

var tab_id_users = [];
var valid_token = "";
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
  it("Création des utilisateurs fictif", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
      tab_id_users = _.map(value, "_id");
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

describe("POST - /login", () => {
  it("Authentification d'un utilisateur fictif.", (done) => {
    UserService.loginUser("user1", "1234", null, function (err, value) {
      valid_token = value.token;
      done();
    });
  });
});

chai.use(chaiHttp);

describe("PUT - /like", () => {
  it("Like un post correctement. - S", (done) => {
    chai
      .request(server)
      .put("/like/" + tab_id_users[1])
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("Like un post déja like. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + tab_id_users[1])
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Like un post par son créateur. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + tab_id_users[0])
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Like un post incorrect. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + tab_id_users[1])
      .query({ post_id: "741852963" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Like un post introuvable. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + tab_id_users[1])
      .query({ post_id: "66ae373b60772f1819846f8d" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it("Like d'un post par un utilisateur incorrect. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + "741852963")
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Like d'un post par un utilisateur introuvable. - E", (done) => {
    chai
      .request(server)
      .put("/like/" + "66ae373b60772f1819846f8d")
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("DELETE - /dislike", () => {
  it("Dislike un post correctement. - S", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + tab_id_users[1])
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("Dislike un post non like. - E", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + tab_id_users[1])
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Dislike un post incorrect. - E", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + tab_id_users[1])
      .query({ post_id: "7410852963" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Dislike un post introuvable. - E", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + tab_id_users[1])
      .query({ post_id: "66ae373b60772f1819846f8d" })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it("Dislike d'un post par un utilisateur incorrect. - E", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + "741852963")
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(405);
        done();
      });
  });
  it("Dislike d'un post par un utilisateur introuvable. - E", (done) => {
    chai
      .request(server)
      .delete("/dislike/" + "66ae373b60772f1819846f8d")
      .query({ post_id: post_id.toString() })
      .auth(valid_token, { type: "bearer" })
      .end((err, res) => {
        res.should.have.status(404);
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

describe("DELETE - /post", () => {
  it("Suppression du post fictif", (done) => {
    PostService.deleteOnePost(post_id, null, function (err, value) {
      expect(value).to.haveOwnProperty("_id");
      done();
    });
  });
});
