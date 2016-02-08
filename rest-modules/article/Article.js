module.exports = function (app, mongoose) {

    var Article = new mongoose.Schema({
        title: {
            type: String
        },
        description: {
            type: String
        },
        content: {
            type: String,
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'ru']
        },
        author: {
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

    return mongoose.model('Article', Article);
}
