module.exports = function (app, mongoose) {

    var ContentTagAssignment = mongoose.Schema({
        tagId: {
            type: String,
            mandatory: true
        },
        contentId: {
            type: String,
            mandatory: true
        }
    });

    return mongoose.model('ContentTagAssignment', ContentTagAssignment);
}
