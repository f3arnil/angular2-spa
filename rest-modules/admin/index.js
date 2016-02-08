module.exports = function (app) {
    app.get('/admin', function (request, response) {
        response.redirect('/admin-app');
    });

    app.get('/admin-app', function (request, response) {
        response.render('js/admin-app/index.jade', {
            title: 'Express',
            content: 'That is a GET request',
            userId: app.envSettings.user
        });
    });
}
