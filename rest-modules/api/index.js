var ApplicationAPI = function(application, mongoose) {

    var RESTmodules = {};
    var application = application;
    var mongoose = mongoose;

    function pushRESTModule(restModuleName, restModule) {
        RESTmodules[restModuleName] = restModule;
    }

    function getRESTModule(restModuleName) {
        if (RESTmodules[restModuleName] != undefined) {
            return RESTmodules[restModuleName];
        }

        return null;
    }

    function initRestModules(list) {
        var errorHandler = require('../errorHandler')(application);

        for (var i = 0; i < list.length; i++) {
            var restModuleName = list[i];
            var restModule = require('../' + restModuleName + '/')(application, mongoose, this);

            pushRESTModule(restModuleName, restModule);
        }
    }

    function generateResponseObject(operation, status, error, data) {
        if (operation == undefined || operation.length == 0) {
            operation = 'unknown operation';
        }

        if (status == undefined || status.length == 0) {
            status = 'unknown status';
        }

        if (error == undefined) {
            error = null;
        }

        if (data == undefined) {
            data = {};
        }

        return {
            operation: operation,
            status: status,
            error: error,
            data: data,
        }
    }

    function getRequestBodyFieldValue(requestBody, propertyName, defaultValue) {
        if (defaultValue == undefined) {
            defaultValue = null;
        }

        var fieldValue = defaultValue;

        if (requestBody.hasOwnProperty(propertyName) && requestBody[propertyName].length != 0) {
            fieldValue = requestBody[propertyName];
        }

        return fieldValue;
    }



    return {
        pushRESTModule: pushRESTModule,
        getRESTModule: getRESTModule,
        initRestModules: initRestModules,
        generateResponseObject: generateResponseObject,
        getRequestBodyFieldValue: getRequestBodyFieldValue
    }
};

module.exports = ApplicationAPI;
