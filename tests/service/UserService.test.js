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
        UserService.addOneUser(user, function (err, value) {
            // console.log(value)
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
        UserService.addOneUser(user_no_valid, function (err, value) {
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
        UserService.addOneUser(user_no_valid, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('field')
            expect(err['field']).to.equal('username')
            expect(err['msg']).to.equal('Path username value already exist.')
        })
    })
})

describe("addManyUsers", () => {
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

        UserService.addManyUsers(users_tab, function (err, value) {
            tab_id_users = _.map(value, '_id')
            users = [...value, ...users]
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Utilisateurs à ajouter, non valide. - E", (done) => {
        let users_tab_error = [{
            username: "Mike",
            email: "Mike@gmail.com",
            password: "mikel" //champ status manquant
        },{
            username: "Thiery",
            email: "Thiery@gmail.com",
            password: "", //champ vide
            status: "coach"
        },{
            username: "Pep", //duplicate
            email: "Pepe@gmail.com",
            password: "pep",
            status: "joueur"
        }]

        UserService.addManyUsers(users_tab_error, function (err, value) {
            done()
        })
    })
})

describe("deleteOneUser", () => {
    it("Supprimer un utilisateur correct. - S", (done) => {
        UserService.deleteOneUser(id_user_valid, function (err, value) { //callback
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('username')
            expect(value).to.haveOwnProperty('email')
            done()
        })
    })
    it("Supprimer un utilisateur avec id incorrect. - E", (done) => {
        UserService.deleteOneUser("1200", function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer un utilisateur avec un id inexistant. - E", (done) => {
        UserService.deleteOneUser("665f00c6f64f76ba59361e9f", function (err, value) {
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
        UserService.deleteManyUsers(tab_id_users, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_users.length)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.deleteManyUsers("1200", function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
})