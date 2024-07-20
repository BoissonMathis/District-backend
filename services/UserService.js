const UserSchema = require('../schemas/User')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt');

var User = mongoose.model('User', UserSchema)

User.createIndexes()

module.exports.addOneUser = async function (user, callback) {

    const hash = await bcrypt.hash(user.password, 10)
    user.password = hash

    let new_user = new User(user)
    let errors = new_user.validateSync()

    if (errors) {
        // console.log(errors)
        errors = errors['errors']
        let text = Object.keys(errors).map((e) => {
            return errors[e]['properties']['message']
        }).join(' ')
        let fields = _.transform(Object.keys(errors), function (result, value) {
            result[value] = errors[value]['properties']['message'];
        }, {});
        let err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            fields: fields,
            type_error: "validator"
        }
        callback(err)
    } else {
        try {
            await new_user.save()
            callback(null, new_user.toObject())
        } catch (error) {
            // console.log("my error :", error)
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                let err = {
                    msg: `Path ${field} value already exist.`,
                    type_error: "duplicate",
                    field: field
                };
                callback(err);
            } else {
                callback(error);
            }
        }
    }
}

module.exports.addManyUsers = async function (users, callback) {
    let errors = [];

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        const hash = await bcrypt.hash(user.password, 10)
        user.password = hash
        let new_user = new User(user);
        let error = new_user.validateSync();

        if(error) {
            error = error['errors'];
            let text = Object.keys(error).map((e) => {
                return error[e]['properties']['message'];
            }).join(' ');
            let fields = _.transform(Object.keys(error), function (result, value) {
                result[value] = error[value]['properties']['message'];
            }, {});
            errors.push({
                msg: text,
                fields_with_error: Object.keys(error),
                fields: fields,
                index: i,
                type_error: "validator"
            });
        }
    }
    if (errors.length > 0) {
        callback(errors)
    } else {
        try {
            const data = await User.insertMany(users, { ordered: false });
            callback(null, data);
        } catch (error) {
            if (error.code === 11000) {
                const duplicateErrors = error.writeErrors.map(err => {
                    //const field = Object.keys(err.keyValue)[0];
                    const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim();
                    return {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        index: err.index,
                        type_error: "duplicate"
                    };
                });
                callback(duplicateErrors)
            }else{
                callback(error)
            }
        }
    }
}

module.exports.deleteOneUser = function (user_id, callback) {
    if (user_id && mongoose.isValidObjectId(user_id)) {
        User.findByIdAndDelete(user_id).then((value) => {
            try {
                if (value)
                    callback(null, value.toObject())
                else
                    callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
            }
            catch (e) {
                
                callback(e)
            }
        }).catch((e) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

module.exports.deleteManyUsers = function (users_id, callback) {
    if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == users_id.length) {
        users_id = users_id.map((e) => { return new ObjectId(e) })
        User.deleteMany({ _id: users_id }).then((value) => {
            callback(null, value)
        }).catch((err) => {
            callback({ msg: "Erreur mongo suppression.", type_error: "error-mongo" });
        })
    }
    else if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != users_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: users_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (users_id && !Array.isArray(users_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}