const UserService = require('../../services/UserService')
const PostService = require('../../services/PostService')
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash')
var tab_id_users = []
var comments = []
var valid_token = ''
var post_id = ''

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
    it("Création d'un post fictif", (done) => {
        let post = {
            user: rdm_user(tab_id_users),
            contentText: 'Ceci est un post test'
        }
        PostService.addOnePost(post, null, function (err, value) {
            expect(value).to.haveOwnProperty('_id')
            post_id = value._id
            done()
        })
    })
})

describe("POST - /comment", () => {
    it("Ajouter un commentaire. - S", (done) => {
        chai.request(server).post('/comment').auth(valid_token, { type: 'bearer' }).send({
            user: rdm_user(tab_id_users),
            post: post_id,
            contentText: "Ceci est un commentaire"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            comments.push(res.body)
            done()
        });
    })
    it("Ajouter un commentaire incorrect. (avec un id user invalid) - E", (done) => {
        chai.request(server).post('/comment').auth(valid_token, { type: 'bearer' }).send({
            user: '741852',
            contentText: 'un commentaire qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un commentaire incorrect. (avec un id user introuvable) - E", (done) => {
        chai.request(server).post('/comment').auth(valid_token, { type: 'bearer' }).send({
            user_id: '6696711304c71eaa5de75189',
            contentText: 'un commentaire qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un commentaire incorrect. (sans user) - E", (done) => {
        chai.request(server).post('/comment').auth(valid_token, { type: 'bearer' }).send({
            contentText: 'un commentaire qui parle de foot'
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un commentaire incorrect. (sans contentText) - E", (done) => {
        chai.request(server).post('/comment').auth(valid_token, { type: 'bearer' }).send({
            user: rdm_user(tab_id_users)
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un commentaire sans etre authentifié. - E", (done) => {
        chai.request(server).post('/comment').send({
            user: rdm_user(tab_id_users),
            contentText: "Ceci est un commentaire"
        }).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
})

describe("POST - /comments", () => {
    it("Ajouter des commentaires. - S", (done) => {
        chai.request(server).post('/comments').auth(valid_token, { type: 'bearer' }).send([
            {
                user: rdm_user(tab_id_users),
                post: post_id,
                contentText: "Encore un commentaire footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                post: post_id,
                contentText: "Encore et toujour un commentaire footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                post: post_id,
                contentText: "Ho tiens, un commentaire qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(201)
            comments = [...comments, ...res.body]
            done()
        });
    })
    it("Ajouter des commentaires incorrecte. - E", (done) => {
        chai.request(server).post('/comments').auth(valid_token, { type: 'bearer' }).send([
            {
                contentText: "Encore un commentaire footballistique"
            },
            {
                user: rdm_user(tab_id_users),
            },
            {
                user: "6696711304c71eaa5de75189",
                contentText: "Ho tiens, un commentaire qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(405)   
            done()
        });
    })
    it("Ajouter des commentaires sans etre authentifié. - E", (done) => {
        chai.request(server).post('/comments').send([
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore un commentaire footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Encore et toujour un commentaire footballistique"
            },
            {
                user: rdm_user(tab_id_users),
                contentText: "Ho tiens, un commentaire qui parle de foot"
            },
        ]).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
})

describe("GET - /comment/:id", () => {
    it("Chercher un commentaire correct. - S", (done) => {
        chai.request(server).get('/comment/' + comments[0]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Chercher un commentaire incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/comment/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher un commentaire incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/comment/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    
    it("Chercher un commentaire correct sans etre authentifié. - E", (done) => {
        chai.request(server).get('/comment/' + comments[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("GET - /comments", () => {
    it("Chercher plusieurs commentaires. - S", (done) => {
        chai.request(server).get('/comments').auth(valid_token, { type: 'bearer' }).query({id: _.map(comments, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body).to.be.an('array')
            done()
        })
    })

    it("Chercher plusieurs commentaires incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/comments').auth(valid_token, { type: 'bearer' }).query({id: ["66791a552b38d88d8c6e9ee7", "66791a822b38d88d8c6e9eed"]})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher plusieurs commentaires incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).get('/comments').auth(valid_token, { type: 'bearer' }).query({id: ['123', '456']})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher plusieurs commentaires sans etre authentifié. - E", (done) => {
        chai.request(server).get('/comments').query({id: _.map(comments, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /comment", () => {
    it("Modifier un commentaire. - S", (done) => {
        chai.request(server).put('/comment/' + comments[0]._id).auth(valid_token, { type: 'bearer' }).send({ contentText: "Nouveau text" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier un commentaire avec un id invalide. - E", (done) => {
        chai.request(server).put('/comment/123456789').auth(valid_token, { type: 'bearer' }).send({contentText: "Nouveau text"})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un commentaire avec un id inexistant. - E", (done) => {
        chai.request(server).put('/comment/66791a552b38d88d8c6e9ee7').auth(valid_token, { type: 'bearer' }).send({contentText: "Nouveau text"})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier un commentaire avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/comment/' + comments[0]._id).auth(valid_token, { type: 'bearer' }).send({contentText: ""})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un commentaire sans etre authentifié. - E", (done) => {
        chai.request(server).put('/comment/' + comments[0]._id).send({ contentText: "Nouveau text" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /comments", () => {
    it("Modifier plusieurs commentaires. - S", (done) => {
        chai.request(server).put('/comments').auth(valid_token, { type: 'bearer' }).query({id: _.map(comments, '_id')}).send({ contentText: "Nouveau text sur plusieurs commentaires" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier plusieurs commentaires avec des ids invalide. - E", (done) => {
        chai.request(server).put('/comments').auth(valid_token, { type: 'bearer' }).query({id: ['267428142', '41452828']}).send({ contentText: "Nouveau text sur plusieurs commentaires" })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs commentaires avec des ids inexistant. - E", (done) => {
        chai.request(server).put('/comments').auth(valid_token, { type: 'bearer' }).query({id: ['66791a552b38d88d8c6e9ee7', '667980886db560087464d3a7']})
        .send({ contentText: "Nouveau text sur plusieurs commentaires" })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier des commentaires avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/comments').auth(valid_token, { type: 'bearer' }).query({id: _.map(comments, '_id')}).send({ contentText: "" })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs commentaires sans etre authentifié. - E", (done) => {
        chai.request(server).put('/comments').query({id: _.map(comments, '_id')}).send({ contentText: "Nouveau text sur plusieurs commentaires" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /comment", () => {
    it("Supprimer un commentaire. - S", (done) => {
        chai.request(server).delete('/comment/' + comments[0]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Supprimer un commentaire incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/comment/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Supprimer un commentaire incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/comment/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer un commentaire sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/comment/' + comments[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /comments", () => {
    it("Supprimer plusieurs commentaires incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/comments/665f18739d3e172be5daf092&665f18739d3e172be5daf093').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Supprimer plusieurs comments incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/comments').query({id: ['123', '456']}).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer plusieurs commentaires sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/comments').query({id: _.map(comments, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })

    it("Supprimer plusieurs commentaires. - S", (done) => {
        chai.request(server).delete('/comments').auth(valid_token, { type: 'bearer' }).query({id: _.map(comments, '_id')})
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

describe("DELETE - /post", () => {
    it("Suppression du post fictif", (done) => {
        PostService.deleteOnePost(post_id, null, function (err, value) {
            expect(value).to.haveOwnProperty('_id')
            done()
        })
    })
})
