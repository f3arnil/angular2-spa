module.exports = function (app, mongoose, api) {

    var api = api;
    var model = require('./Role.js')(app, mongoose);

    // Get user permissions
    app.get('/role/:userId', function (request, response) {
        var operationName = 'get user permissions';
        var userId = request.params.userId;

        return model.findOne({ userId: userId }, function (error, data) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            return response.send(api.generateResponseObject(operationName, 'ok', null, data));
        });
    });

    // Set user permissions
    app.post('/role/set/:userId', function (request, response) {
        var operationName = 'set user permissions';
        var userId = request.params.userId;

        return model.findOne({userId: userId}, function (error, data) {
            var requestPermissions = request.body.permissions != undefined ? request.body.permissions : [];
            var roleName = request.body.name != undefined ? request.body.name : null;
            var randomRoleName = 'Unnamed role ' + Math.floor(Math.random() * 1000000);

            if (data == null) {
                // Create permission
                var role = new model({
                    name: roleName != null ? roleName : randomRoleName,
                    permissions: requestPermissions,
                    userId: userId
                });

                role.save(function (error) {
                    if (!error) {
                        return response.send(api.generateResponseObject(operationName, 'ok', null, role));
                    }

                    return response.send(api.generateResponseObject(operationName, 'error', error));
                });
            }
            else {
                // Update permission
                if (request.body.permissions == undefined) {
                    return response.send(api.generateResponseObject(operationName, 'error', 'You did not specify permissions', data));
                }

                if (roleName != null) {
                    data.name = roleName;
                }

                data.permissions = requestPermissions;

                data.save(function (error) {
                    if (!error) {
                        return response.send(api.generateResponseObject(operationName, 'ok', null, data));
                    }

                    return response.send(api.generateResponseObject(operationName, 'error', error));
                });
            }
        });
    });
}
