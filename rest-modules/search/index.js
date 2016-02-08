module.exports = function(app, mongoose, api) {

    var api = api;
    var config = require('../../config.json');
    var Async = require('async');
    var _ = require('underscore');

    app.get('/search-app', searchAppIndexPageRequest);

    app.get('/service/search', searchRequest);

    app.post('/service/advanced-search', advancedSearchRequest);

    function searchAppIndexPageRequest (request, response) {
        response.render('js/search-app/index.jade', {
            way: 'js/search-app/',
            backEndData: 'That is a message from Backend',
            userId: app.envSettings.user
        });
    }

    /**
     * @param request:
     * - query - search query, the search is working by rule "CONTAINS IN"
     * - searchIn - context (entity) name for searching in (must persist in "config.json" in "/rest-modules" folder)
     * - field - field for applying the query (must persist in "config.json" in "/rest-modules" folder)
     * - orderBy - field for ordering response
     * - sortBy - order direction (ASC, DESC)
     * - offset - a number of search result items that should be ignored from the beginning
     * - limit - a number of search result items that should be returned
     * @param response
     * @returns {*}
     */
    function searchRequest(request, response) {
        var operationName = 'search';

        var query = request.param('query')
            ? request.param('query').trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
            : '.';

        var searchingEntity = request.param('searchIn')
            ? request.param('searchIn').trim()
            : config.search.searchIn;

        var searchingField = request.param('field')
            ? request.param('field').trim()
            : config.search.field;

        var sortingField = request.param('orderBy')
            ? request.param('orderBy').trim()
            : config.search.orderBy;

        var sortingOrder = request.param('sortBy')
            ? request.param('sortBy').trim()
            : config.search.sortBy;

        var offset = request.param('offset')
            ? parseInt(request.param('offset').trim())
            : 0;

        var limit = request.param('limit')
            ? parseInt(request.param('limit').trim())
            : 0;

        var entityModel = api.getRESTModule(searchingEntity);

        if (entityModel == undefined || entityModel == null) {
            return response.send(api.generateResponseObject(
                operationName,
                'error',
                'Looks like ' + searchingEntity + ' does not implemented or does not loaded at the moment...'
            ));
        }
        else {
            entityModel = entityModel.getModel();
        }

        if (!config.search.validSearchEntities.hasOwnProperty(searchingEntity)) {
            return response.send(api.generateResponseObject(
                operationName,
                'error',
                'Entity ' + searchingEntity + ' does not available for searching'
            ));
        }

        if (config.search.validSearchEntities[searchingEntity].indexOf(searchingField) == -1) {
            return response.send(api.generateResponseObject(
                operationName,
                'error',
                'Field ' + searchingField + ' in entity ' + searchingEntity + ' does not available for searching'
            ));
        }

        var searchingRegexp = new RegExp(query, 'i');
        var searchingFieldData = {};
        var orderingFieldData = {};

        searchingFieldData[searchingField] = searchingRegexp;
        orderingFieldData[sortingField] = sortingOrder == 'ASC' ? '1' : '-1';

        return entityModel
            .find()
            .or([ searchingFieldData ])
            .sort(orderingFieldData)
            .exec(function (error, data) {
                var finalData = {};

                if (offset < 0) {
                    offset = 0;
                }
                else if (offset > data.length) {
                    offset = data.length;
                }

                if (limit < 0) {
                    limit = 0;
                }
                else if (limit == 0) {
                    limit = data.length;
                }
                else if (limit > data.length) {
                    limit = data.length;
                }

                var filteredItems = data.slice(
                    offset,
                    offset + limit
                );

                var contextResults = {
                    foundItems: data,
                    offset: offset,
                    limit: limit,
                    context: searchingEntity,
                    sortingColumn: sortingField,
                    sortingOrder: sortingOrder == 'ASC' ? '1' : '-1'
                }

                finalData[searchingEntity] = _buildContextSearchResults(contextResults, filteredItems);

                return response.json(api.generateResponseObject(
                    'search simple',
                    error == null ? 'ok' : 'error',
                    error == null ? null : error,
                    finalData
                ));
            }
        );
    }

    /**
     *
     * @param request POST fields {
     *      "context": {
     *          "TABLE_NAME": {
     *              "conditions": [
     *                  {
     *                      "field": "FIELD_1_NAME,FIELD_2_NAME,...,FIELD_n_NAME",
     *                      "query": "QUERY",
     *                      "match": "STARTS_FROM || CONTAINS || EXACT",
     *                      "condition_op": "NONE || AND || OR"
     *                      // First object could not has a condition_op value instead "NONE"
     *                      // because each condition_op affects only previous one oject.
     *                      // For example, if you want to create A && B logic use next way:
     *                      // A: { condition_op: "NONE"; }, B: { condition_op: "AND"; }
     *                  },
     *                  {
     *                      "field": "FIELD_NAME",
     *                      "query": "QUERY",
     *                      "match": "STARTS_FROM || CONTAINS || EXACT",
     *                      "condition_op": "NONE || AND || OR"
     *                  }
     *              ],
     *              "sortingOrder": "ASC",
     *              "sortingField": "title"
     *          }
     *      },
     *      "limits": {
     *          "offset": 0,
     *          "limit": 0,
     *      }
     * }
     * @param response
     */
    function advancedSearchRequest(request, response) {
        _AS_getContexts(request.body, response);
    }

    function _AS_getContexts(requestJSON, response) {
        var contexts = [];
        var limits = null;

        if (requestJSON.hasOwnProperty('limits')) {
            limits = {
                offset: requestJSON.limits.hasOwnProperty('offset') ? requestJSON.limits.offset : 0,
                limit: requestJSON.limits.hasOwnProperty('limit') ? requestJSON.limits.limit : 0
            };
        }

        if (requestJSON.hasOwnProperty('context')) {
            for (contextName in requestJSON.context) {
                var context = _AS_buildContext(contextName, requestJSON.context[contextName], limits);

                contexts.push(context);
            }
        }

        _AS_buildContextsRequest(contexts, response);
    }

    function _AS_buildContext(contextName, contextData, limits) {
        var conditions = [];
        var sortingOrder = 'ASC';
        var sortingField = '';

        if (contextData.hasOwnProperty('sortingOrder')) {
            switch (contextData.sortingOrder.trim()) {
                case 'desc':
                case 'DESC':
                case '-1':
                    sortingOrder = '-1'; break;
                case 'asc':
                case 'ASC':
                case '1':
                default:
                    sortingOrder = '1'; break;
            }
        }

        if (contextData.hasOwnProperty('sortingField')) {
            sortingField = contextData.sortingField;
        }

        if (contextData.hasOwnProperty('conditions')) {
            for (var i = 0; i < contextData.conditions.length; i++) {
                var condition = contextData.conditions[i];

                if (i == 0) {
                    condition.condition_op = 'NONE';
                }

                if (i > 0 && (i < contextData.conditions.length) && condition.condition_op == 'NONE') {
                    break;
                }

                var fields = _AS_filterFieldValue(condition, 'field').split(',');

                if (sortingField.length == 0) {
                    sortingField = fields[0];
                }

                conditions.push(_AS_buildConditionObject(
                    fields,
                    _AS_filterFieldValue(condition, 'query'),
                    _AS_filterFieldValue(condition, 'match'),
                    _AS_filterFieldValue(condition, 'condition_op')
                ));
            }
        }

        var sorter = {};
        sorter[sortingField] = sortingOrder;

        return _AS_buildConditionsRequest(conditions, contextName, limits, sorter);
    }

    function _AS_buildConditionsRequest(conditions, contextName, limits, sorter) {
        var runnableCallback = function (callback) {

            var model = api.getRESTModule(contextName);

            if (model == null) {
                return;
            }

            model = model.getModel();
            var databaseQuery = model.find();

            databaseQuery = _AS_buildQueryConditions(conditions, databaseQuery);

            databaseQuery.sort(sorter);

            return databaseQuery.exec(function (error, data) {
                if (error) {
                    console.log('Oups... Something bad on executing context condition request!');
                    console.log(error);
                }

                var dataObject = {
                    foundItems: data,
                    offset: limits.offset,
                    limit: limits.limit,
                    context: contextName,
                    sortingColumn: Object.keys(sorter)[0],
                    sortingOrder: sorter[Object.keys(sorter)[0]]
                };

                callback(error, dataObject);
            });
        }

        return runnableCallback;
    }

    function _AS_buildQueryConditions(conditions, databaseQuery) {
        var conditionUnions = [];
        var requestFields = {};

        _AS_fillConditionRequests(conditions, conditionUnions, requestFields)

        if (requestFields != null && requestFields.length != 0) {
            conditionUnions.push(requestFields);
        }

        if (conditionUnions.length > 0) {
            databaseQuery.or(conditionUnions);
        }

        return databaseQuery;
    }

    function _AS_fillConditionRequests(conditions, conditionUnions, requestFields) {
        for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
            var condition = conditions[conditionIndex];

            if (condition.conditionOperator == 'OR') {
                conditionUnions.push(requestFields);
                requestFields = {};
            }

            _AS_fillConditionRequestFields(requestFields, condition);
        }
    }

    function _AS_fillConditionRequestFields(requestFields, condition) {
        for (var fieldIndex = 0; fieldIndex < condition.fieldName.length; fieldIndex++) {
            if (requestFields.hasOwnProperty(condition.fieldName[fieldIndex])) {
                continue;
            }

            requestFields[condition.fieldName[fieldIndex]] = _AS_getQueryRegexp(condition.matchingOperator, condition.requestQuery);
        }
    }

    function _AS_buildContextsRequest(contexts, response) {

        Async.parallel(contexts, function (error, data) {
            if (error) {
                console.log("ASync parallel request error:");
                console.log(error);
            }

            var finalData = {};

            _.each(data, function (contextResult, index) {
                var context = contextResult.context;
                var filteredItems = contextResult.foundItems;

                if (contextResult.offset < 0) {
                    contextResult.offset = 0;
                }
                else if (contextResult.offset > filteredItems.length) {
                    contextResult.offset = filteredItems.length;
                }

                if (contextResult.limit < 0) {
                    contextResult.limit = 0;
                }
                else if (contextResult.limit > filteredItems.length) {
                    contextResult.limit = filteredItems.length
                }

                if (contextResult.limit > 0) {
                    filteredItems = contextResult.foundItems.slice(
                        contextResult.offset,
                        contextResult.offset + contextResult.limit
                    );
                }

                finalData[context] = _buildContextSearchResults(contextResult, filteredItems);
            });

            return response.json(api.generateResponseObject(
                'search advanced',
                error == null ? 'ok' : 'error',
                error == null ? null : error,
                finalData
            ));
        });
    }

    function _AS_buildConditionObject(fieldName, requestQuery, matchingOperator, conditionOperator) {
        return {
            fieldName: fieldName,
            requestQuery: requestQuery,
            matchingOperator: matchingOperator,
            conditionOperator: conditionOperator
        };
    }

    function _AS_getQueryRegexp(matchingOperator, query) {

        switch (matchingOperator) {
            case 'STARTS_FROM': return new RegExp('^' + query, 'i')
            case 'CONTAINS': return new RegExp(query, 'i');
            case 'EXACT': return new RegExp('^' + query + '$', 'i');
            default: return new RegExp(query, 'i');
        }
    }

    function _AS_filterFieldValue(condition, fieldName) {
        if (condition[fieldName] != undefined && condition[fieldName] != null) {
            return _AS_cleanString(condition[fieldName]);
        }

        return '';
    }

    function _AS_cleanString(value) {
        if (value != undefined && value != null) {
            return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }

        return '';
    }

    function _buildContextSearchResults(contextResult, items) {
        var totalItemsFound = contextResult.foundItems.length;
        var maxPageIndex = Math.ceil(totalItemsFound / contextResult.limit);
        var pageNumber = contextResult.limit > 0
            ? Math.ceil((contextResult.offset + contextResult.limit) / contextResult.limit)
            : 1;
        var itemsPerPage = contextResult.limit > 0
            ? contextResult.limit
            : contextResult.foundItems.length;

        if (pageNumber > maxPageIndex) {
            pageNumber = maxPageIndex;
        }

        if (itemsPerPage > items.length) {
            itemsPerPage = items.length;
        }

        return {
            count: totalItemsFound,
            page: pageNumber,
            perPage: itemsPerPage,
            itemsForward: items.length,
            sortingColumn: contextResult.sortingColumn,
            sortingOrder: contextResult.sortingOrder,
            items: items
        }
    }
};
