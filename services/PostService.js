const PostSchema = require('../schemas/Post')
const _ = require('lodash')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

let Post = mongoose.model('Post', PostSchema)

Post.createIndexes()

module.exports.addOnePost = async function (post, options, callback) {
    try{
        var new_post = new Post(post);
        var errors = new_post.validateSync();

        if (errors) {
            // console.log('mon erreur:', errors.errors)
            // console.log('ma propriété path:', errors.errors.user.path)
            errors = errors['errors'];
            var path = Object.keys(errors).map((e) => {
                return errors[e]['properties']['path'];
            });
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties']['message'];
            }, {});
            var err = {
                msg: `Veuillez renseigner un(e) ${path}`,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
        }else {
            await new_post.save();
            callback(null, new_post.toObject());
        }
    }catch(error){
        if (error.code === 11000) { // Erreur de duplicité
            var field = Object.keys(error.keyValue)[0];
            var err = {
                msg: `Ce ${field} exist déja.`,
                fields_with_error: [field],
                fields: { [field]: `The ${field} is already taken.` },
                type_error: "duplicate"
            };
            callback(err);
        } else {
            var err = {
                msg: "Format de requete invalid",
                type_error: "validator"
            }
            callback(err);
        }
    }
};

module.exports.addManyPosts = async function (posts, options, callback) {
    var errors = [];
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        post.user_id = options && options.user ? options.user._id : post.user_id
        var new_post = new Post(post);
        var error = new_post.validateSync();
        if (error) {
            error = error['errors'];
            var text = Object.keys(error).map((e) => {
                return error[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(error), function (result, value) {
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
        callback(errors);
    } else {
        try {
            const data = await Post.insertMany(posts, { ordered: false });
            callback(null, data);
        } catch (error) {
            if (error.code === 11000) { // Erreur de duplicité
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
                callback(duplicateErrors);
            } else {
                callback(errors);
            }
        }
    }
};

module.exports.findOnePostById = function (post_id, options, callback) {
    let opts = {populate: options && options.populate ? ["user_id"] : []}

    if (post_id && mongoose.isValidObjectId(post_id)) {
        Post.findById(post_id, null, opts).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun post trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
                console.log(e)
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
}

module.exports.findManyPostsById = function (posts_id, options, callback) {
    let opts = {populate: (options && options.populate ? ['user_id'] : []), lean: true}

    if (posts_id && Array.isArray(posts_id) && posts_id.length > 0 && posts_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == posts_id.length) {
        posts_id = posts_id.map((e) => { return new ObjectId(e) })
        Post.find({ _id: posts_id }, null, opts).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun post trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
                console.log(e)
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (posts_id && Array.isArray(posts_id) && posts_id.length > 0 && posts_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != posts_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: posts_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (posts_id && !Array.isArray(posts_id)) {
        callback({ msg: "L'argument n'est pas un tableau.", type_error: 'no-valid' });
    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}


module.exports.findOnePost = function (tab_field, value, options, callback) {
    let opts = {populate: options && options.populate ? ['user'] : []}
    var field_unique = ['contentText']

    if (tab_field && Array.isArray(tab_field) && value && _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length == 0) {
        var obj_find = []
        _.forEach(tab_field, (e) => {
            obj_find.push({[e]: value})
        })
        Post.findOne({ $or: obj_find}, null, opts).then((value) => {
            if (value){
                callback(null, value.toObject())
            }else {
                callback({msg: "Post non trouvé.", type_error: "no-found"})
            }
        }).catch((err) => {
            callback({msg: "Error interne mongo", type_error:'error-mongo'})
        })
    }
    else {
        let msg = ''
        if(!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrecte."
        }
        if(!value){
            msg += msg ? " Et la valeur de recherche est vide" : "La valeur de recherche est vide"
        }
        if(_.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length > 0) {
            var field_not_authorized = _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1})
            msg += msg ? ` Et (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisé.` : 
            `Les champs (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisé.`
            callback({ msg: msg, type_error: 'no-valid', field_not_authorized: field_not_authorized })
        }
        else{
            callback({ msg: msg, type_error: 'no-valid'})
        }
    }
}

module.exports.findManyPosts = function(search, field, limit, page, options, callback) {
    let populate = options && options.populate ? ['user'] : [];
    page = !page ? 1 : parseInt(page);
    limit = !limit ? 10 : parseInt(limit);

    if (typeof page !== "number" || typeof limit !== "number" || isNaN(page) || isNaN(limit)) {
        callback({msg: `format de ${typeof page !== "number" ? "page" : "limit"} est incorrect`, type_error: "no-valid"});
    } else {
        let query_mongo = {};
        if (search) {
            query_mongo[field] = { $regex: search, $options: 'i' };
        }
        Post.countDocuments(query_mongo).then((count) => {
            if (count > 0) {
                const skip = (page - 1) * limit;
                Post.find(query_mongo, null, {skip: skip, limit: limit, lean: true})
                    .populate(populate)
                    .then((results) => {
                        callback(null, {count: count, results: results});
                    })
                    .catch((err) => {
                        callback(err);
                    });
            } else {
                callback(null, {count: 0, results: []});
            }
        }).catch((err) => {
            callback(err);
        });
    }
}

module.exports.updateOnePost = function (post_id, update, options, callback) {
    update.user = options && options.user ? options.user._id : update.user
    update.updated_at = new Date()

    if (post_id && mongoose.isValidObjectId(post_id)) {
        Post.findByIdAndUpdate(new ObjectId(post_id), update, { returnDocument: 'after', runValidators: true }).then((value) => {
            try {
                if (value)
                    callback(null, value.toObject())
                else
                    callback({ msg: "Post non trouvé.", type_error: "no-found" });
            } catch (e) {
                callback(e)
            }
        }).catch((errors) => {
            if(errors.code === 11000){
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            }else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}


module.exports.updateManyPosts = function (posts_id, update, options, callback) {
    update.user = options && options.user ? options.user._id : update.user

    if (posts_id && Array.isArray(posts_id) && posts_id.length > 0 && posts_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == posts_id.length) {
        posts_id = posts_id.map((e) => { return new ObjectId(e) })
        Post.updateMany({ _id: posts_id }, update, { runValidators: true }).then((value) => {
            try {
                if(value && value.matchedCount != 0){
                    callback(null, value)
                }else {
                    callback({msg: 'Posts non trouvé', type_error: 'no-found'})
                }
            } catch (e) {
                callback(e)
            }
        }).catch((errors) => {
            if(errors.code === 11000){
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    index: errors.index,
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            }else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

module.exports.deleteOnePost = function (post_id, options, callback) {
    if (post_id && mongoose.isValidObjectId(post_id)) {
        Post.findByIdAndDelete(post_id).then((value) => {
            try {
                if (value)
                    callback(null, value.toObject())
                else
                    callback({ msg: "Post non trouvé.", type_error: "no-found" });
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

module.exports.deleteManyPosts = function (posts_id, options, callback) {
    let opts = options

    if (posts_id && Array.isArray(posts_id) && posts_id.length > 0 && posts_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == posts_id.length) {
        posts_id = posts_id.map((e) => { return new ObjectId(e) })
        Post.deleteMany({ _id: posts_id }).then((value) => {
            callback(null, value)
        }).catch((err) => {
            callback({ msg: "Erreur mongo suppression.", type_error: "error-mongo" });
        })
    }
    else if (posts_id && Array.isArray(posts_id) && posts_id.length > 0 && posts_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != posts_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: posts_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (posts_id && !Array.isArray(posts_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}