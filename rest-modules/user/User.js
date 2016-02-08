module.exports = function (app, mongoose) {

    var User = new mongoose.Schema({
        name: {
            type: String,
            mandatory: true
        },
        password: {
            type: String,
            mandatory: true
        },
        email: {
            type: String,
            mandatory: true
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

    return mongoose.model('User', User);
}
