// const UserService = require("../../services/UserService");
// const PostService = require("../../services/PostService");
// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const expect = chai.expect;
// const server = require("./../../server");
// const _ = require("lodash");

// var tab_id_users = [];
// var valid_token = "";
// let posts_id = [];

// let users = [
//   {
//     username: "user1",
//     email: "user1@gmail.com",
//     password: "1234",
//     status: "educator",
//   },
//   {
//     username: "user2",
//     email: "user2@gmail.com",
//     password: "1234",
//     status: "coach",
//   },
// ];

// describe("POST - /users", () => {
//   it("Création des utilisateurs fictif", (done) => {
//     UserService.addManyUsers(users, null, function (err, value) {
//       tab_id_users = _.map(value, "_id");
//       done();
//     });
//   });
// });

// describe("POST - /posts", () => {
//   it("Création des posts fictif", (done) => {
//     let posts = [
//       {
//         user: tab_id_users[1],
//         contentText: "Ceci est un post test",
//       },
//       {
//         user: tab_id_users[2],
//         contentText: "Ceci est un deuxieme post test",
//       },
//       {
//         user: tab_id_users[1],
//         contentText: "Ceci est un troisieme post test",
//       },
//       {
//         user: tab_id_users[2],
//         contentText: "Ceci est un quatrieme post test",
//       },
//     ];
//     PostService.addManyPosts(posts, null, function (err, value) {
//       expect(value).to.have.lengthOf(4);
//       posts_id = _.map(value, "_id");
//       done();
//     });
//   });
// });

// describe("POST - /login", () => {
//   it("Authentification d'un utilisateur fictif.", (done) => {
//     UserService.loginUser("user1", "1234", null, function (err, value) {
//       valid_token = value.token;
//       done();
//     });
//   });
// });

// chai.use(chaiHttp);

// describe("PUT - /repost", () => {
//   it("Repost un post correctement. - S", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + tab_id_users[1])
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(200);
//         done();
//       });
//   });
//   it("Repost un post déja repost. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + tab_id_users[1])
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Repost un post par son créateur. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + tab_id_users[0])
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Repost un post incorrect. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + tab_id_users[1])
//       .query({ post_id: "741852963" })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Repost un post introuvable. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + tab_id_users[1])
//       .query({ post_id: "66ae373b60772f1819846f8d" })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(404);
//         done();
//       });
//   });
//   it("Repost d'un post par un utilisateur incorrect. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + "741852963")
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Repost d'un post par un utilisateur introuvable. - E", (done) => {
//     chai
//       .request(server)
//       .put("/repost/" + "66ae373b60772f1819846f8d")
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(404);
//         done();
//       });
//   });
// });

// describe("DELETE - /cancelrepost", () => {
//   it("Cancel d'un repost correctement. - S", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + tab_id_users[1])
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(200);
//         done();
//       });
//   });
//   it("Cancel d'un repost inexistant sur un post. - E", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + tab_id_users[1])
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Cancel d'un repost sur un post incorrect. - E", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + tab_id_users[1])
//       .query({ post_id: "7410852963" })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Cancel d'un repost sur un post introuvable. - E", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + tab_id_users[1])
//       .query({ post_id: "66ae373b60772f1819846f8d" })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(404);
//         done();
//       });
//   });
//   it("Cancel d'un repost par un utilisateur incorrect. - E", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + "741852963")
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(405);
//         done();
//       });
//   });
//   it("Cancel d'un repost par un utilisateur introuvable. - E", (done) => {
//     chai
//       .request(server)
//       .delete("/cancelrepost/" + "66ae373b60772f1819846f8d")
//       .query({ post_id: post_id.toString() })
//       .auth(valid_token, { type: "bearer" })
//       .end((err, res) => {
//         res.should.have.status(404);
//         done();
//       });
//   });
// });

// describe("DELETE - /users", () => {
//   it("Suppression des utilisateurs fictif", (done) => {
//     UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
//       done();
//     });
//   });
// });

// describe("DELETE - /posts", () => {
//   it("Suppression des posts fictif", (done) => {
//     PostService.deleteManyPosts(posts_id, null, function (err, value) {
//       expect(value).to.haveOwnProperty("deletedCount");
//       expect(value["deletedCount"]).to.equal(posts_id.length);
//       done();
//     });
//   });
// });
