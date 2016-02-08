module.exports = function (app) {
    app.get('/', function (request, response) {
        response.redirect('/search-app');
    });
}
