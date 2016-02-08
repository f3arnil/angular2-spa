module.exports = function (app, mongoose) {

    var uniqueValidator = require('mongoose-unique-validator');

    var Tag = mongoose.Schema({
        name: {
            type: String,
            mandatory: true,
            required: true,
            unique: true,
            index: true
        },
        textColor: {
            type: String,
            mandatory: false,
            default: '#000'
        },
        backgroundColor: {
            type: String,
            mandatory: false,
            default: '#EEE'
        },
        glyph: {
            type: String,
            mandatory: false,
            default: 'none'
        },
        published: {
            type: Boolean,
            mandatory: false,
            default: true
        }
    });

    Tag.plugin(uniqueValidator);

    return mongoose.model('Tag', Tag);
}
