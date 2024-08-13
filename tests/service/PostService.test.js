const PostService = require('../../services/PostService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')

let tab_id_users = []
let posts = []
let id_post_valid = ''
let tab_id_posts = []

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

describe("addOnePost", () => {
    it("Post correct. - S", (done) => {
        let post_valid = {
            user: rdm_user(tab_id_users),
            contentText: 'Ceci est un post test'
        }
        PostService.addOnePost(post_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
            id_post_valid = value._id
            posts.push(value)
            done()
        })
    })
    it("Post incorrect. (sans user) - E", (done) => {
        let post_without_user = {
            contentText: 'Ceci est un post test',
        }
        PostService.addOnePost(post_without_user, null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error')
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('user')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['msg']).to.equal('Veuillez renseigner un(e) user')
            done()
        })
    })
    it("Post incorrect. (sans contentText) - E", (done) => {
        let post_without_textContent = {
            user: rdm_user(tab_id_users)
        }
        PostService.addOnePost(post_without_textContent, null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error')
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('contentText')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['msg']).to.equal('Veuillez renseigner un(e) contentText')
            done()
        })
    })
    it("Post incorrect. (avec id incorrect dans user) - E", (done) => {
        let post_with_incorrect_id = {
            user: '124568',
            contentText: 'Ceci est un post test'
        }
        PostService.addOnePost(post_with_incorrect_id, null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['msg']).to.equal('Format de requete invalid')
            expect(err['type_error']).to.equal('validator')
            done()
        })
    })
})

describe("addManyPosts", () => {
    it("Posts à ajouter, valide. - S", (done) => {
        var posts_tab = [{
            user: rdm_user(tab_id_users),
            contentText: 'Deuxieme post test'
        },{
            user: rdm_user(tab_id_users),
            contentText: 'troisieme post'
        },{
            user: rdm_user(tab_id_users),
            contentText: 'Quatrieme post'
        }]

        PostService.addManyPosts(posts_tab, null, function (err, value) {
            tab_id_posts = _.map(value, '_id')
            posts = [...value, ...posts]
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Posts à ajouter, invalide. - E", (done) => {
        var invalide_posts_tab = [{
            contentText: 'Deuxieme post test'
        },{
            user: rdm_user(tab_id_users),
        }]

        PostService.addManyPosts(invalide_posts_tab, null, function (err, value) {
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

describe("findOnePostById", () => {
    it("Chercher un post existant avec un id correct. - S", (done) => {
        PostService.findOnePostById(id_post_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            done()
        })
    })
    it("Chercher un post inexistant avec un id introuvale. - E", (done) => {
        PostService.findOnePostById('66a2bfe9c6586ef77eef101d', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun post trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher un post inexistant avec un id incorrect. - E", (done) => {
        PostService.findOnePostById('123456789', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('ObjectId non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyPostsById", () => {
    it("Chercher des posts existant correct. - S", (done) => {
        PostService.findManyPostsById(tab_id_posts, null, function (err, value) {
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Chercher des posts inexistant avec id correct. - E", (done) => {
        PostService.findManyPostsById(['66a2bfe9c6586ef77eef101d', '66a2bfe9c6586ef77eef101c'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun post trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher des posts inexistant avec id incorrect. - E", (done) => {
        PostService.findManyPostsById(['13654789', '987123456'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme plusieurs éléments ne sont pas des ObjectId.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Chercher des posts avec une query vide. - E", (done) => {
        PostService.findManyPostsById([], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findOnePost", () => {
    it("Chercher un post par les champs selectionnées. - S", (done) => {
        PostService.findOnePost(["contentText"], posts[0].contentText, null, function (err, value) {
            expect(value).to.haveOwnProperty('contentText')
            expect(value['contentText']).to.equal(posts[0].contentText)
            done()
        })
    })
    it("Chercher un post par un champ non autorisé. - E", (done) => {
        PostService.findOnePost(["test"], posts[0].contentText, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Les champs (test) ne sont pas des champs de recherche autorisé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('field_not_authorized')
            done()
        })
    })
    it("Chercher un post sans champ de recherche. - E", (done) => {
        PostService.findOnePost([], posts[0].contentText, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Error interne mongo')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('error-mongo')
            done()
        })
    })
    it("Chercher un post avec une valeur de recherche vide. - E", (done) => {
        PostService.findOnePost(['contentText'], '', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('La valeur de recherche est vide')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyPosts", () => {
    it("Faire une recherche valide sur le contentText - S", (done) => {
        PostService.findManyPosts('test', 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(2)
            expect(value["results"]).lengthOf(2)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le contentText avec une query vide - S", (done) => {
        PostService.findManyPosts(null, 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(4)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le user avec un id correct - S", (done) => {
        PostService.findManyPosts(users[0]._id, 'user', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(value["results"].length)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le contentText avec une query qui ne correspond a aucun post - S", (done) => {
        PostService.findManyPosts('awtbrieoqpmfnhgsekl', 'contentText', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(0)
            expect(value["results"]).lengthOf(0)
            expect(err).to.be.null
            done()
        })
    })
})

describe("updateOnePost", () => {
    it("Modifier un post correct. - S", (done) => {
        PostService.updateOnePost(id_post_valid, { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            expect(value['contentText']).to.be.equal('Ceci est un update')
            done()
        })
    })
    it("Modifier un post inexistant. - S", (done) => {
        PostService.updateOnePost('66a2bfe9c6586ef77eef101c', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Post non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Modifier un post avec un id incorrect. - S", (done) => {
        PostService.updateOnePost('741852963', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("updateManyPosts", () => {
    it("Modifier plusieurs posts correctement. - S", (done) => {
        PostService.updateManyPosts(tab_id_posts, { contentText: "Ceci est un update many" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_posts.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_posts.length)
            done()
        })
    })
    it("Modifier plusieurs posts avec id incorrect. - E", (done) => {
        PostService.updateManyPosts(['177852', '7412863'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs posts avec id introuvable. - E", (done) => {
        PostService.updateManyPosts(['66a2bfe9c6586ef77eef101c', '66a2bfe9c6586ef77eef101d'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Posts non trouvé')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
})

describe("deleteOnePost", () => {
    it("Delete un post incorrectement. (id introuvable) - E", () => {
        PostService.deleteOnePost('66a2bfe9c6586ef77eef101c', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Post non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
        })
    })
    it("Delete un post incorrectement. (id no-valid) - E", () => {
        PostService.deleteOnePost('123456789', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            
        })
    })
    it("Delete un post correctement. - S", () => {
        PostService.deleteOnePost(id_post_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
        })
    })
})

describe("deleteManyPosts", () => {
    it("Supprimer plusieurs posts avec id introuvable. - S", (done) => {
        PostService.deleteManyPosts(["66a2bfe9c6586ef77eef101c", "66a2bfe9c6586ef77eef101d"], null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).to.equal(0)
            done()
        })
    })
    it("Supprimer plusieurs posts avec id incorrect. - E", (done) => {
        PostService.deleteManyPosts(["1200", "7415852"], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Supprimer plusieurs posts correctement. - S", (done) => {
        PostService.deleteManyPosts(tab_id_posts, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_posts.length)
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