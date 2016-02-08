module.exports = function(app) {
    // Error 404
    app.use(function (request, response) {
        response.status(404);
        response.render(__dirname + '/views/404.jade', {
            title: 'Error 404: Page not found'
        });
    });

    // Error 500
    app.use(function (error, request, response, next) {
        response.status(500);
        response.render(__dirname + '/views/500.jade', {
            title: 'Error 500: Internal server error',
            error: error
        });
    });
}
