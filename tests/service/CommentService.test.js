const CommentService = require('../../services/CommentService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')

let tab_id_users = []
let comments = []
let id_comment_valid = ''
let tab_id_comments = []

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
            users = value
            done()
        })
    })
})

function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}

// chai.use(chaiHttp)

describe("addOneComment", () => {
    it("Comment correct. - S", () => {
        let comment_valid = {
            user: rdm_user(tab_id_users),
            contentText: 'Ceci est un commentaire test'
        }
        CommentService.addOneComment(comment_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
            id_comment_valid = value._id
            comments.push(value)
        })
    })
    it("Commentaire incorrect. (sans user) - E", () => {
        let comment_without_user = {
            contentText: 'Ceci est un commentaire test',
        }
        CommentService.addOneComment(comment_without_user, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('fields_with_error')
            expect(value).to.haveOwnProperty('fields')
            expect(value['fields']).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Veuillez renseigner un(e) user')
        })
    })
    it("Commentaire incorrect. (sans contentText) - E", () => {
        let comment_without_textContent = {
            user: rdm_user(tab_id_users)
        }
        CommentService.addOneComment(comment_without_textContent, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('fields_with_error')
            expect(value).to.haveOwnProperty('fields')
            expect(value['fields']).to.haveOwnProperty('contentText')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Veuillez renseigner un(e) contentText')
        })
    })
    it("Commentaire incorrect. (avec id incorrect dans user) - E", () => {
        let comment_with_incorrect_id = {
            user: '124568',
            contentText: 'Ceci est un commentaire test'
        }
        CommentService.addOneComment(comment_with_incorrect_id, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Format de requete invalid')
            expect(value['type_error']).to.equal('validator')
        })
    })
})

describe("addManyComments", () => {
    it("Comments à ajouter, valide. - S", (done) => {
        var comments_tab = [{
            user: rdm_user(tab_id_users),
            contentText: 'Deuxieme comment test'
        },{
            user: rdm_user(tab_id_users),
            contentText: 'troisieme comment'
        },{
            user: rdm_user(tab_id_users),
            contentText: 'Quatrieme comment'
        }]

        CommentService.addManyComments(comments_tab, null, function (err, value) {
            tab_id_comments = _.map(value, '_id')
            comments = [...value, ...comments]
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Commentaires à ajouter, invalide. - E", (done) => {
        var invalide_comments_tab = [{
            contentText: 'Deuxieme post test'
        },{
            user: rdm_user(tab_id_users),
        }]

        CommentService.addManyComments(invalide_comments_tab, null, function (err, value) {
            expect(err).to.have.lengthOf(2)
            expect(err[0]).to.haveOwnProperty('msg')
            expect(err[0]['msg']).to.equal('Path `user` is required.')
            expect(err[0]).to.haveOwnProperty('index')
            expect(err[0]['index']).to.equal(0)
            expect(err[1]).to.haveOwnProperty('msg')
            expect(err[1]['msg']).to.equal('Path `contentText` is required.')
            expect(err[1]).to.haveOwnProperty('index')
            expect(err[1]['index']).to.equal(1)
            done()
        })
    })
})

describe("findOneCommentById", () => {
    it("Chercher un commentaire existant avec un id correct. - S", (done) => {
        CommentService.findOneCommentById(id_comment_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            done()
        })
    })
    it("Chercher un commentaire inexistant avec un id introuvale. - E", (done) => {
        CommentService.findOneCommentById('66a2bfe9c6586ef77eef101d', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun commentaire trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher un commentaire inexistant avec un id incorrect. - E", (done) => {
        CommentService.findOneCommentById('123456789', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('ObjectId non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyCommentsById", () => {
    it("Chercher des commentaires existant correct. - S", (done) => {
        CommentService.findManyCommentsById(tab_id_comments, null, function (err, value) {
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Chercher des commentaires inexistant avec id correct. - E", (done) => {
        CommentService.findManyCommentsById(['66a2bfe9c6586ef77eef101d', '66a2bfe9c6586ef77eef101c'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun comment trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher des commentaires inexistant avec id incorrect. - E", (done) => {
        CommentService.findManyCommentsById(['13654789', '987123456'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme plusieurs éléments ne sont pas des ObjectId.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Chercher des commentaires avec une query vide. - E", (done) => {
        CommentService.findManyCommentsById([], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findOneComment", () => {
    it("Chercher un commentaire par les champs selectionnées. - S", (done) => {
        CommentService.findOneComment(["user"], comments[0].user, null, function (err, value) {
            expect(value).to.haveOwnProperty('user')
            expect(JSON.stringify(value['user'])).to.equal(JSON.stringify(comments[0].user))
            done()
        })
    })
    it("Chercher un commentaire par un champ non autorisé. - E", (done) => {
        CommentService.findOneComment(["test"], comments[0].contentText, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Les champs (test) ne sont pas des champs de recherche autorisé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('field_not_authorized')
            done()
        })
    })
    it("Chercher un commentaire sans champ de recherche. - E", (done) => {
        CommentService.findOneComment([], comments[0].contentText, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Error interne mongo')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('error-mongo')
            done()
        })
    })
    it("Chercher un commentaire avec une valeur de recherche vide. - E", (done) => {
        CommentService.findOneComment(['user'], '', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('La valeur de recherche est vide')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyComments", () => {
    it("Faire une recherche valide sur le user - S", (done) => {
        CommentService.findManyComments('test', 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(2)
            expect(value["results"]).lengthOf(2)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le contentText avec une query vide - S", (done) => {
        CommentService.findManyComments(null, 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(4)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le contentText avec une query qui ne correspond a aucun commentaire - S", (done) => {
        CommentService.findManyComments('awtbrieoqpmfnhgsekl', 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(0)
            expect(value["results"]).lengthOf(0)
            expect(err).to.be.null
            done()
        })
    })
})

describe("updateOneComment", () => {
    it("Modifier un commentaire correct. - S", (done) => {
        CommentService.updateOneComment(id_comment_valid, { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            expect(value['contentText']).to.be.equal('Ceci est un update')
            done()
        })
    })
    it("Modifier un commentaire inexistant. - E", (done) => {
        CommentService.updateOneComment('66a2bfe9c6586ef77eef101c', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Commentaire non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Modifier un commentaire avec un id incorrect. - S", (done) => {
        CommentService.updateOneComment('741852963', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("updateManyComments", () => {
    it("Modifier plusieurs commentaires correctement. - S", (done) => {
        CommentService.updateManyComments(tab_id_comments, { contentText: "Ceci est un update many" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_comments.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_comments.length)
            done()
        })
    })
    it("Modifier plusieurs commentaires avec id incorrect. - E", (done) => {
        CommentService.updateManyComments(['177852', '7412863'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs commentaires avec id introuvable. - E", (done) => {
        CommentService.updateManyComments(['66a2bfe9c6586ef77eef101c', '66a2bfe9c6586ef77eef101d'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Commentaires non trouvé')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
})

describe("deleteOneComment", () => {
    it("Delete un commentaire incorrectement. (id introuvable) - E", () => {
        CommentService.deleteOneComment('66a2bfe9c6586ef77eef101c', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Commentaire non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
        })
    })
    it("Delete un commentaire incorrectement. (id no-valid) - E", () => {
        CommentService.deleteOneComment('123456789', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            
        })
    })
    it("Delete un comment correctement. - S", () => {
        CommentService.deleteOneComment(id_comment_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
        })
    })
})

describe("deleteManyComments", () => {
    it("Supprimer plusieurs commentaires avec id introuvable. - E", (done) => {
        CommentService.deleteManyComments(["66a2bfe9c6586ef77eef101c", "66a2bfe9c6586ef77eef101d"], null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).to.equal(0)
            done()
        })
    })
    it("Supprimer plusieurs commentaires avec id incorrect. - E", (done) => {
        CommentService.deleteManyComments(["1200", "7415852"], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Supprimer plusieurs comments correctement. - S", (done) => {
        CommentService.deleteManyComments(tab_id_comments, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_comments.length)
            done()
        })
    })
});

describe("DELETE - /users", () => {
    it("Suppression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
})