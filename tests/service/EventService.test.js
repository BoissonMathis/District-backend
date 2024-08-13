const EventService = require('../../services/EventService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')

let tab_id_users = []
let events = []
let id_event_valid = ''
let tab_id_events = []

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

describe("addOneEvent", () => {
    it("Event correct. - S", () => {
        let event_valid = {
            user: rdm_user(tab_id_users),
            type: "match",
            date: "23 novembre 2024",
            categorie: "U8 - U9",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "10 rue du faubourg, montbéliard"
        }
        EventService.addOneEvent(event_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
            expect(value).to.haveOwnProperty('type')
            expect(value).to.haveOwnProperty('date')
            expect(value).to.haveOwnProperty('level')
            expect(value).to.haveOwnProperty('categorie')
            expect(value).to.haveOwnProperty('place')
            id_event_valid = value._id
            events.push(value)
            done()
        })
    })
    it("Evenement incorrect. (sans user) - E", () => {
        let event_without_user = {
            type: "match",
            date: "23 novembre 2024",
            categorie: "U8 - U9",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "10 rue du faubourg, montbéliard"
        }
        EventService.addOneEvent(event_without_user, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('fields_with_error')
            expect(value).to.haveOwnProperty('fields')
            expect(value['fields']).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Veuillez renseigner un(e) user')
        })
    })
    it("Evenement incorrect. (sans contentText) - E", () => {
        let event_without_type = {
            user: rdm_user(tab_id_users),
            date: "23 novembre 2024",
            categorie: "U8 - U9",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "10 rue du faubourg, montbéliard"
        }
        EventService.addOneEvent(event_without_type, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('fields_with_error')
            expect(value).to.haveOwnProperty('fields')
            expect(value['fields']).to.haveOwnProperty('contentText')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Veuillez renseigner un(e) contentText')
        })
    })
    it("Evenement incorrect. (avec id incorrect dans user) - E", () => {
        let event_with_incorrect_id = {
            user: '741852963',
            type: "match",
            date: "23 novembre 2024",
            categorie: "U8 - U9",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "10 rue du faubourg, montbéliard"
        }
        EventService.addOneEvent(event_with_incorrect_id, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('msg')
            expect(value).to.haveOwnProperty('type_error')
            expect(value['msg']).to.equal('Format de requete invalid')
            expect(value['type_error']).to.equal('validator')
        })
    })
})

describe("addManyEvents", () => {
    it("Evenements à ajouter, valide. - S", (done) => {
        var events_tab = [{
            user: rdm_user(tab_id_users),
            type: "match",
            date: "23 novembre 2024",
            categorie: "U12 - U13",
            level: "R3",
            contentText: 'Ceci est un match test',
            place: "10 rue du faubourg, montbéliard"
        },{
            user: rdm_user(tab_id_users),
            type: "tournoi",
            date: "17 decembre 2024",
            categorie: "U10 - U11",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "21 rue du stade, mercueil"
        },{
            user: rdm_user(tab_id_users),
            type: "plateau",
            date: "10 janvier 2025",
            categorie: "U6 - U7",
            level: "D3",
            contentText: 'Ceci est un evenement plateau',
            place: "10 rue du faubourg, montbéliard"
        }]

        EventService.addManyEvents(events_tab, null, function (err, value) {
            tab_id_events = _.map(value, '_id')
            events = [...value, ...events]
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Evenements à ajouter, invalide. - E", (done) => {
        var invalide_events_tab = [{
            user: rdm_user(tab_id_users),
            date: "23 novembre 2024",
            categorie: "U12 - U13",
            level: "R3",
            contentText: 'Ceci est un match test',
            place: "10 rue du faubourg, montbéliard"
        },{
            type: "tournoi",
            date: "17 decembre 2024",
            categorie: "U10 - U11",
            level: "D1",
            contentText: 'Ceci est un evenement test',
            place: "21 rue du stade, mercueil"
        },{
            user: rdm_user(tab_id_users),
            type: "plateau",
            date: "10 janvier 2025",
            categorie: "U6 - U7",
            level: "D3",
            place: "10 rue du faubourg, montbéliard"
        }]

        EventService.addManyEvents(invalide_events_tab, null, function (err, value) {
            expect(err).to.have.lengthOf(3)
            expect(err[0]).to.haveOwnProperty('msg')
            expect(err[0]['msg']).to.equal('Path `type` is required.')
            expect(err[0]).to.haveOwnProperty('index')
            expect(err[0]['index']).to.equal(0)
            expect(err[1]).to.haveOwnProperty('msg')
            expect(err[1]['msg']).to.equal('Path `user` is required.')
            expect(err[1]).to.haveOwnProperty('index')
            expect(err[1]['index']).to.equal(1)
            done()
        })
    })
})

describe("findOneEventById", () => {
    it("Chercher un evenement existant avec un id correct. - S", (done) => {
        EventService.findOneEventById(id_event_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            done()
        })
    })
    it("Chercher un evenement inexistant avec un id introuvale. - E", (done) => {
        EventService.findOneEventById('66a2bfe9c6586ef77eef101d', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun evenement trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher un evenement inexistant avec un id incorrect. - E", (done) => {
        EventService.findOneEventById('123456789', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('ObjectId non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyEventsById", () => {
    it("Chercher des evenements existant correct. - S", (done) => {
        EventService.findManyEventsById(tab_id_events, null, function (err, value) {
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Chercher des evenements inexistant avec id correct. - E", (done) => {
        EventService.findManyEventsById(['66a2bfe9c6586ef77eef101d', '66a2bfe9c6586ef77eef101c'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Aucun evenement trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Chercher des evenements inexistant avec id incorrect. - E", (done) => {
        EventService.findManyEventsById(['13654789', '987123456'], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme plusieurs éléments ne sont pas des ObjectId.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Chercher des evenements avec une query vide. - E", (done) => {
        EventService.findManyEventsById([], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Tableau non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findOneEvent", () => {
    it("Chercher un evenement par les champs selectionnées. - S", (done) => {
        EventService.findOneEvent(["user"], events[0].user, null, function (err, value) {
            expect(value).to.haveOwnProperty('user')
            expect(JSON.stringify(value['user'])).to.equal(JSON.stringify(events[0].user))
            done()
        })
    })
    it("Chercher un evenement par un champ non autorisé. - E", (done) => {
        EventService.findOneEvent(["test"], events[0].categorie, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Les champs (test) ne sont pas des champs de recherche autorisé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            expect(err).to.haveOwnProperty('field_not_authorized')
            done()
        })
    })
    it("Chercher un evenement sans champ de recherche. - E", (done) => {
        EventService.findOneEvent([], events[0].level, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Error interne mongo')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('error-mongo')
            done()
        })
    })
    it("Chercher un evenement avec une valeur de recherche vide. - E", (done) => {
        EventService.findOneEvent(['categorie'], '', null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('La valeur de recherche est vide')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("findManyEvents", () => {
    it("Faire une recherche valide sur la categorie - S", (done) => {
        EventService.findManyEvents('U8 - U9', 'categorie', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(1)
            expect(value["results"]).lengthOf(1)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur le level avec une query vide - S", (done) => {
        EventService.findManyEvents(null, 'level', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(4)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            done()
        })
    })
    it("Faire une recherche sur la categorie avec une query qui ne correspond a aucun evenement - S", (done) => {
        EventService.findManyEvents('U18', 'categorie', 3, 1, null, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(0)
            expect(value["results"]).lengthOf(0)
            expect(err).to.be.null
            done()
        })
    })
})

describe("updateOneEvent", () => {
    it("Modifier un evenement correct. - S", (done) => {
        EventService.updateOneEvent(id_event_valid, { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('contentText')
            expect(value['contentText']).to.be.equal('Ceci est un update')
            done()
        })
    })
    it("Modifier un evenement inexistant. - E", (done) => {
        EventService.updateOneEvent('66a2bfe9c6586ef77eef101c', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Evenement non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
    it("Modifier un evenement avec un id incorrect. - S", (done) => {
        EventService.updateOneEvent('741852963', { contentText: "Ceci est un update" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
})

describe("updateManyEvents", () => {
    it("Modifier plusieurs evenements correctement. - S", (done) => {
        EventService.updateManyEvents(tab_id_events, { contentText: "Ceci est un update many" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_events.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_events.length)
            done()
        })
    })
    it("Modifier plusieurs evenements avec id incorrect. - E", (done) => {
        EventService.updateManyEvents(['177852', '7412863'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs evenements avec id introuvable. - E", (done) => {
        EventService.updateManyEvents(['66a2bfe9c6586ef77eef101c', '66a2bfe9c6586ef77eef101d'], { contentText: "Ceci est un autre update many" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Evenement non trouvé')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
            done()
        })
    })
})

describe("deleteOneEvent", () => {
    it("Delete un evenement incorrectement. (id introuvable) - E", () => {
        EventService.deleteOneEvent('66a2bfe9c6586ef77eef101c', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Evenement non trouvé.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-found')
        })
    })
    it("Delete un evenement incorrectement. (id no-valid) - E", () => {
        EventService.deleteOneEvent('123456789', null, function (err, value) {
            expect(err).to.be.a('object');
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('Id invalide.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.equal('no-valid')
            
        })
    })
    it("Delete un evenement correctement. - S", () => {
        EventService.deleteOneEvent(id_event_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user')
            expect(value).to.haveOwnProperty('contentText')
            expect(value).to.haveOwnProperty('type')
            expect(value).to.haveOwnProperty('date')
            expect(value).to.haveOwnProperty('level')
            expect(value).to.haveOwnProperty('categorie')
            expect(value).to.haveOwnProperty('place')
        })
    })
})

describe("deleteManyEvents", () => {
    it("Supprimer plusieurs evenements avec id introuvable. - E", (done) => {
        EventService.deleteManyEvents(["66a2bfe9c6586ef77eef101c", "66a2bfe9c6586ef77eef101d"], null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).to.equal(0)
            done()
        })
    })
    it("Supprimer plusieurs evenements avec id incorrect. - E", (done) => {
        EventService.deleteManyEvents(["1200", "7415852"], null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            expect(err).to.haveOwnProperty('fields')
            done()
        })
    })
    it("Supprimer plusieurs evenements correctement. - S", (done) => {
        EventService.deleteManyEvents(tab_id_events, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_events.length)
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