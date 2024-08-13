var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var UserService = require('./../services/UserService')
const ConfigFile = require('../config')

const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use('login', new LocalStrategy({passReqToCallback: true}, function(req, username, password, done){
    UserService.loginUser(username, password, null, done)
}))

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: ConfigFile.secret_key,
    passReqToCallback: true
}, function(req, jwt_payload, done) {
    // déchiffrer le token et lire les informations dedans. (_id) => pour recherche l'utilisateur
    UserService.findOneUserById(jwt_payload._id, null, function(err, value){
        if(err){
            done(err)
        }else if(value.token == ''){
            done(null, false, {msg:"unauthorized", type_error:'no-valid'})
        }else{
            done(null, value)
        }
    })
}))

module.exports = passport