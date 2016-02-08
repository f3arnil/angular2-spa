module.exports = function (app, mongoose) {

    var Publication = new mongoose.Schema({
        title: {
            type: String
        },
        publisher: {
            type: String
        },
        publicationType: {
            type: String,
            default: 'Book',
            enum: ['Book', 'Magazine']
        },
        issn: {
            type: String
        },
        isbn13: {
            type: String
        },
        publishingYearFrom: {
            type: Number
        },
        publishingYearTill: {
            type: Number
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'ru']
        },
        publishingCountry: {
            type: String
        },
        created: {
            type: Date,
            default: Date.now
        },
        updated: {
            type: Date,
            default: Date.now
        },
        published: {
            type: Boolean,
            default: true
        }
    });

    return mongoose.model('Publication', Publication);
}
