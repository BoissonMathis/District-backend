const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash')

var users = []

chai.use(chaiHttp)

describe("POST - /user", () => {
    it("Ajouter un utilisateur. - S", (done) => {
        chai.request(server).post('/user').send({
            username: "Lutfu",
            email: "Lutfu@gmaill.com",
            password: "lutfu",
            status: "joueur",
            follows: []
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans email) - E", (done) => {
        chai.request(server).post('/user').send({
            username: "Lutfu",
            password: "lutfu",
            status: "joueur",
            follows: []
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un username existant) - E", (done) => {
        chai.request(server).post('/user').send({
            username: "Lutfu",
            email: "Lutf@gamil.com",
            password: "lutfu",
            status: "joueur",
            follows: []
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/user').send({
            username: "",
            email: "Lutfu@gamil.com",
            password: "lutfu",
            status: "joueur",
            follows: []
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /users", () => {
    it("Ajouter plusieurs utilisateurs. - S", (done) => {
        chai.request(server).post('/users').send([{
            username: "Aurelien",
            email: "Aurelien@gamil.com",
            password: "aurelien",
            status: "joueur",
            follows: []
        },
        {
            username: "John",
            email: "John@gamil.com",
            password: "john",
            status: "educateur",
            follows: []
        }]
        ).end((err, res) => {
            res.should.have.status(201)

            users = [...users, ...res.body]
            done()
        });
    })
})

describe("DELETE - /user", () => {
    it("Supprimer un utilisateur. - S", (done) => {
        console.log(users)
        console.log('user to delete :', users[0]._id)
        chai.request(server).delete('/user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/user/665f18739d3e172be5daf092')
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/user/123')
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /users", () => {
    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/users/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/users').query({id: ['123', '456']})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})