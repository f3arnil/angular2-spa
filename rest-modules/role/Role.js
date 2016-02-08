module.exports = function (app, mongoose) {

    var Role = new mongoose.Schema({
        name: {
            type: String,
            mandatory: true
        },
        userId: {
            type: String,
            mandatory: true
        },
        permissions: {
            type: Array,
            default: []
        }
    });

    return mongoose.model('Role', Role);
}
