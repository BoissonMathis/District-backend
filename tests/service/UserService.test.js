const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
let id_user_valid = ""
let tab_id_users = []
let users = []

describe("addOneUser", () => {
    it("Utilisateur correct. - S", () => {
        let user = {
            username: "Frank",
            email: "Frank@gmail.com",
            password: "frank",
            status: "educator"
        }
        UserService.addOneUser(user, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('username')
            expect(value).to.haveOwnProperty('email')
            expect(value).to.haveOwnProperty('status')
            id_user_valid = value._id
        })
    })
    it("Utilisateur incorrect. (Sans username) - E", () => {
        let user_no_valid = {
            email: "Frank2@test.com",
            password: "frank",
            status: "club"
        }
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('username')
            expect(err['fields']['username']).to.equal('Path `username` is required.')
        })
    })
    it("Utilisateur incorrect. (Username déja utilisé) - E", () => {
        let user_no_valid = {
            username: "Frank",
            email: "Frank2@test.com",
            password: "frank",
            status: "club"
        }
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('field')
            expect(err['field']).to.equal('username')
            expect(err['msg']).to.equal('Path username value already exist.')
        })
    })
})

describe("addManyUsers", () => {
    it("Utilisateurs à ajouter, non valide. - E", (done) => {
        var users_tab_error = [{
            username: "Frank",
            email: "Mikel@gmail.com",
            password: "mikel",
            status: "educator"
        },{
            username: "Thierry",
            email: "Thierry@gmail.com",
            password: "thierry"
        },{
            username: "",
            email: "Pep@gmail.com",
            password: "pep",
            status: "joueur"
        }]

        UserService.addManyUsers(users_tab_error, null, function (err, value) {
            done()
        })
    })
    it("Utilisateurs à ajouter, valide. - S", (done) => {
        var users_tab = [{
            username: "Mikel",
            email: "Mikel@gmail.com",
            password: "mikel",
            status: "educator"
        },{
            username: "Thierry",
            email: "Thierry@gmail.com",
            password: "thierry",
            status: "coach"
        },{
            username: "Pep",
            email: "Pep@gmail.com",
            password: "pep",
            status: "joueur"
        }]

        UserService.addManyUsers(users_tab, null, function (err, value) {
            tab_id_users = _.map(value, '_id')
            users = [...value, ...users]
            expect(value).lengthOf(3)
            done()
        })
    })
})

describe("findOneUser", () => {
    it("Chercher un utilisateur par les champs selectionnées. - S", (done) => {
        UserService.findOneUser(["email", "username"], users[0].username, null, function (err, value) {
            expect(value).to.haveOwnProperty('username')
            done()

        })
    })
    it("Chercher un utilisateur avec un champ non autorisé. - E", (done) => {
        UserService.findOneUser(["email", "username"], users[0].bio, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un utilisateur sans tableau de champ. - E", (done) => {
        UserService.findOneUser("email", users[0].username, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un utilisateur inexistant. - E", (done) => {
        UserService.findOneUser(["email"], "users[0].username", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
})

describe("findManyUsers", () => {
    it("Retourne 4 utilisateurs - S", (done) => {
        UserService.findManyUsers(null, 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(4)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            done()
        })
    })
    it("Envoie d'une chaine de caractère a la place de la page - E", (done) => {
        UserService.findManyUsers(null, "coucou", 3, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error")
            expect(err["type_error"]).to.be.equal("no-valid")
            expect(value).to.undefined
            done()
        })
    })
})

describe("findOneUserById", () => {
    it("Chercher un utilisateur existant correct. - S", (done) => {
        UserService.findOneUserById(id_user_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('username')
            done()

        })
    })
    it("Chercher un utilisateur non-existant correct. - E", (done) => {
        UserService.findOneUserById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err["type_error"]).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyUsersById", () => {
    it("Chercher des utilisateurs existant correct. - S", (done) => {
        UserService.findManyUsersById(tab_id_users, null, function (err, value) {
            expect(value).lengthOf(3)
            done()

        })
    })
})

describe("updateOneUser", () => {
    it("Modifier un utilisateur correct. - S", (done) => {
        UserService.updateOneUser(id_user_valid, { username: "Jean", bio: "Luc" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('username')
            expect(value).to.haveOwnProperty('bio')
            expect(value['username']).to.be.equal('Jean')
            expect(value['bio']).to.be.equal('Luc')
            done()
        })
    })
    it("Modifier un utilisateur avec id incorrect. - E", (done) => {
        UserService.updateOneUser("1200", { username: "Jean", bio: "Luc" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier un utilisateur avec des champs requis vide. - E", (done) => {
        UserService.updateOneUser(id_user_valid, { username: "", bio: "Luc" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('username')
            expect(err['fields']['username']).to.equal('Path `username` is required.')
            done()
        })
    })
})

describe("updateManyUsers", () => {
    it("Modifier plusieurs utilisateurs correctement. - S", (done) => {
        UserService.updateManyUsers(tab_id_users, { bio: "Ceci est une bio" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_users.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_users.length)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.updateManyUsers("1200", { bio: "Ceci est une bio" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
})

describe("deleteOneUser", () => {
    it("Supprimer un utilisateur correct. - S", (done) => {
        UserService.deleteOneUser(id_user_valid, null, function (err, value) { //callback
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('username')
            expect(value).to.haveOwnProperty('email')
            done()
        })
    })
    it("Supprimer un utilisateur avec id incorrect. - E", (done) => {
        UserService.deleteOneUser("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer un utilisateur avec un id inexistant. - E", (done) => {
        UserService.deleteOneUser("665f00c6f64f76ba59361e9f", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        })
    })
})

describe("deleteManyUsers", () => {
    it("Supprimer plusieurs utilisateurs correctement. - S", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_users.length)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.deleteManyUsers("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
})