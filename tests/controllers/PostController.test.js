const UserService = require('../../services/UserService')
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash')
var tab_id_users = []
var posts = []
var valid_token = ''

let users = [
    {
        username: "user1",
        email:"user1@gmail.com",
        password: "1234",
        status: "educator"
    },
    {
        username: "user2",
        email:"user2@gmail.com",
        password: "1234",
        status: "coach"
    },
    {
        username: "user3",
        email:"user3@gmail.com",
        password: "1234",
        status: "joueur"
    }
];

describe("POST - /users", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, '_id')
            done()
        })
    })
})

describe("POST - /login", () => {
    it("Authentification d'un utilisateur fictif.", (done) => {
        UserService.loginUser('user1', "1234", null, function(err, value) {
            valid_token = value.token
            done()
        })
    })
})

function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}

chai.use(chaiHttp)

describe("POST - /post", () => {
    it("Ajouter un post. - S", (done) => {
        chai.request(server).post('/post').auth(valid_token, { type: 'bearer' }).send({
            user: rdm_user(tab_id_users),
            contentText: "Ceci est un post"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            posts.push(res.body)
            done()
        });
    })
    it("Ajouter un post incorrect. (avec un id user invalid) - E", (done) => {
        chai.request(server).post('/post').auth(valid_token, { type: 'bearer' }).send({
            user: '741852',
            contentText: 'un post qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un post incorrect. (avec un id user introuvable) - E", (done) => {
        chai.request(server).post('/post').auth(valid_token, { type: 'bearer' }).send({
            user_id: '6696711304c71eaa5de75189',
            contentText: 'un post qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un post incorrect. (sans user) - E", (done) => {
        chai.request(server).post('/post').auth(valid_token, { type: 'bearer' }).send({
            contentText: 'un post qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un post incorrect. (sans contentText) - E", (done) => {
        chai.request(server).post('/post').auth(valid_token, { type: 'bearer' }).send({
            user: rdm_user(tab_id_users)
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un post sans etre authentifié. - E", (done) => {
        chai.request(server).post('/post').send({
            user: rdm_user(tab_id_users),
            contentText: "Ceci est un post"
        }).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
})

describe("POST - /posts", () => {
    it("Ajouter des posts. - S", (done) => {
        chai.request(server).post('/posts').auth(valid_token, { type: 'bearer' }).send([
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore un post footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore et toujour un post footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Ho tiens, un post qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(201)
            posts = [...posts, ...res.body]
            done()
        });
    })
    it("Ajouter des posts incorrecte. - E", (done) => {
        chai.request(server).post('/posts').auth(valid_token, { type: 'bearer' }).send([
            {
                contentText: "Encore un post footballistique"
            },
            {
                user: rdm_user(tab_id_users),
            },
            {
                user: "6696711304c71eaa5de75189",
                contentText: "Ho tiens, un post qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(405)   
            done()
        });
    })
    it("Ajouter des posts sans etre authentifié. - E", (done) => {
        chai.request(server).post('/posts').send([
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore un post footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore et toujour un post footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Ho tiens, un post qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
})

describe("GET - /post/:id", () => {
    it("Chercher un post correct. - S", (done) => {
        chai.request(server).get('/post/' + posts[0]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Chercher un post incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/post/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher un post incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/post/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    
    it("Chercher un post correct sans etre authentifié. - E", (done) => {
        chai.request(server).get('/post/' + posts[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("GET - /posts", () => {
    it("Chercher plusieurs posts. - S", (done) => {
        chai.request(server).get('/posts').auth(valid_token, { type: 'bearer' }).query({id: _.map(posts, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body).to.be.an('array')
            done()
        })
    })

    it("Chercher plusieurs posts incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/posts').auth(valid_token, { type: 'bearer' }).query({id: ["66791a552b38d88d8c6e9ee7", "66791a822b38d88d8c6e9eed"]})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher plusieurs posts incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).get('/posts').auth(valid_token, { type: 'bearer' }).query({id: ['123', '456']})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher plusieurs posts sans etre authentifié. - E", (done) => {
        chai.request(server).get('/posts').query({id: _.map(posts, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /post", () => {
    it("Modifier un post. - S", (done) => {
        chai.request(server).put('/post/' + posts[0]._id).auth(valid_token, { type: 'bearer' }).send({ contentText: "Nouveau text" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier un post avec un id invalide. - E", (done) => {
        chai.request(server).put('/post/123456789').auth(valid_token, { type: 'bearer' }).send({contentText: "Nouveau text"})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un post avec un id inexistant. - E", (done) => {
        chai.request(server).put('/post/66791a552b38d88d8c6e9ee7').auth(valid_token, { type: 'bearer' }).send({contentText: "Nouveau text"})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier un post avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/post/' + posts[0]._id).auth(valid_token, { type: 'bearer' }).send({contentText: ""})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un post sans etre authentifié. - E", (done) => {
        chai.request(server).put('/post/' + posts[0]._id).send({ contentText: "Nouveau text" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /posts", () => {
    it("Modifier plusieurs posts. - S", (done) => {
        chai.request(server).put('/posts').auth(valid_token, { type: 'bearer' }).query({id: _.map(posts, '_id')}).send({ contentText: "Nouveau text sur plusieurs posts" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier plusieurs posts avec des ids invalide. - E", (done) => {
        chai.request(server).put('/posts').auth(valid_token, { type: 'bearer' }).query({id: ['267428142', '41452828']}).send({ contentText: "Nouveau text sur plusieurs posts" })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs posts avec des ids inexistant. - E", (done) => {
        chai.request(server).put('/posts').auth(valid_token, { type: 'bearer' }).query({id: ['66791a552b38d88d8c6e9ee7', '667980886db560087464d3a7']})
        .send({ contentText: "Nouveau text sur plusieurs posts" })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier des posts avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/posts').auth(valid_token, { type: 'bearer' }).query({id: _.map(posts, '_id')}).send({ contentText: "" })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs posts sans etre authentifié. - E", (done) => {
        chai.request(server).put('/posts').query({id: _.map(posts, '_id')}).send({ contentText: "Nouveau text sur plusieurs posts" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /post", () => {
    it("Supprimer un post. - S", (done) => {
        chai.request(server).delete('/post/' + posts[0]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Supprimer un post incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/post/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Supprimer un post incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/post/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer un post sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/post/' + posts[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /posts", () => {
    it("Supprimer plusieurs posts incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/posts/665f18739d3e172be5daf092&665f18739d3e172be5daf093').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Supprimer plusieurs posts incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/posts').query({id: ['123', '456']}).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer plusieurs posts sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/posts').query({id: _.map(posts, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })

    it("Supprimer plusieurs posts. - S", (done) => {
        chai.request(server).delete('/posts').auth(valid_token, { type: 'bearer' }).query({id: _.map(posts, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
})

describe("DELETE - /users", () => {
    it("Suppression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
})
