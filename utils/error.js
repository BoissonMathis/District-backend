const _ = require('lodash')
// module.exports.handleErrors = function(errors, callback) {
//     if (errors.code === 11000) {
//         const field = Object.keys(errors.keyPattern)[0];
//         const duplicateErrors = {
//             msg: `Duplicate key error: ${field} must be unique.`,
//             fields_with_error: [field],
//             index: errors.index,
//             fields: { [field]: `The ${field} is already taken.` },
//             type_error: "duplicate"
//         };
//         callback(duplicateErrors);
//     } else {
//         const errorDetails = errors.errors;
//         const text = Object.keys(errorDetails).map((e) => errorDetails[e].properties.message).join(' ');
//         const fields = _.transform(Object.keys(errorDetails), (result, value) => {
//             result[value] = errorDetails[value].properties.message;
//         }, {});
//         const err = {
//             msg: text,
//             fields_with_error: Object.keys(errorDetails),
//             fields: fields,
//             type_error: "validator"
//         };
//         callback(err);
//     }
// }

module.exports.handleErrors = function(errors, callback) {
    console.log('handleError se declenche')
    // console.log(errors)
    if (errors.code === 11000) {
        var field = Object.keys(errors.keyPattern)[0];
        const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate"
        };
        callback(duplicateErrors);
    } else {
        errors = errors['errors'];
        console.log(errors)
        console.log('LAAAAAAAAAAAAAAAAA', errors)
        var text = Object.keys(errors).map((e) => {
            if(errors[e]['properties'])
                return errors[e]['properties'] ? errors[e]['properties']['message']:errors[e]['reason'] ;
        }).join(' ');
        var fields = _.transform(Object.keys(errors), function (result, value) {
            console.log(value, errors[value]['properties'])
            result[value] = errors[value]['properties'] ? errors[value]['properties']['message']:String(errors[value]['reason']) ;
        }, {});
        console.log(fields)
        var err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            fields: fields,
            type_error: "validator"
        };
        console.log(err)
        callback(err);
    }
}

// if (errors.code === 11000) {
//     var field = Object.keys(errors.keyPattern)[0];
//     const duplicateErrors = {
//         msg: `Duplicate key error: ${field} must be unique.`,
//         fields_with_error: [field],
//         fields: { [field]: `The ${field} is already taken.` },
//         type_error: "duplicate"
//     };
//     callback(duplicateErrors);
// } else {
//     errors = errors['errors'];
//     var text = Object.keys(errors).map((e) => {
//         return errors[e]['properties']['message'];
//     }).join(' ');
//     var fields = _.transform(Object.keys(errors), function (result, value) {
//         result[value] = errors[value]['properties']['message'];
//     }, {});
//     var err = {
//         msg: text,
//         fields_with_error: Object.keys(errors),
//         fields: fields,
//         type_error: "validator"
//     };
//     callback(err);
// }