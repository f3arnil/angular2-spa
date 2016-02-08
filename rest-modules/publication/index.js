module.exports = function (app, mongoose, api) {

    var api = api;
    var model = require('./Publication.js')(app, mongoose);

    // Routes list
    // -----------
    app.get('/service/publication/:id', getPublicationRequest);
    app.get('/search/publication/:searchQuery', searchPublicationRequest);
    app.get('/generate/publication/:number', generateRandomPublicationsRequest);

    // Routes implementation
    // ---------------------
    function getPublicationRequest(request, response) {
        var operationName = 'get publication';
        var publicationId = request.params.id;

        model.findById(publicationId, function (error, data) {
            if (error) {
                response.send(api.generateResponseObject(
                    operationName, 'error', error
                ));
            }

            response.send(api.generateResponseObject(
                operationName, 'ok', null, data
            ));
        });
    }

    function searchPublicationRequest(request, response) {
        var query = request.params.searchQuery;
        var searchRegEx = new RegExp(query, 'i');

        model.find().or([
            {
                title: searchRegEx
            }
        ]).sort('title').exec(function (error, data) {
            response.json(JSON.stringify(data));
        });
    }

    function generateRandomPublicationsRequest(request, response) {
        var numberOfPublications = parseInt(request.params.number);
        var publicationsCreated = 0;

        if (numberOfPublications < 0) {
            numberOfPublications = 1;
        }
        else if (numberOfPublications > 100) {
            numberOfPublications = 100;
        }

        for (var i = 0; i < numberOfPublications; i++) {
            var publication = generateRandomPublication();

            publication.save(function (error) {
                if (error) {
                    console.log('Could not to save an random publication');
                }
            });

            if (publication._id != undefined) {
                publicationsCreated++;
            }
        }

        return response.send(
            api.generateResponseObject(
                'create random publications',
                (publicationsCreated > 0) ? 'ok' : 'error',
                (publicationsCreated > 0) ? null : 'No publication has been created',
                { publicationsCreated: publicationsCreated }
            )
        );
    }

    // Helper functions
    // ----------------
    function getModel() {
        return model;
    }

    function generateRandomPublication() {
        var publishingFrom = 1990 + Math.floor(Math.random() * 20);

        var publication = new model({
            title: 'Random publication [' + Math.floor(Math.random() * 1000000000) + ']',
            publisher: 'Random publication generator',
            publicationType: (Math.random() > 0.5) ? 'Publication' : 'Magazine',
            issn: generateISSN(),
            isbn13: '',
            publishingYearFrom: publishingFrom,
            publishingYearTill: publishingFrom + Math.floor(Math.random() * 10),
            language: 'en',
            publishingCountry: 'Your dreams',
            published: true,
        });

        return publication;
    }

    function generateISSN() {
        var issn = Math.floor((Math.random() + 1) * 10000000 - 9999999);

        if (issn > 9999999) {
            issn /= 10;
        }
        else if (issn < 1000000) {
            issn *= 10;
        }

        var control = 0;
        var digitIndex = 1;
        var issn_control = issn;

        while (issn_control > 0) {
            var currentDigir = issn_control % 10;

            issn_control = Math.floor(issn_control / 10);
            control += currentDigir * digitIndex;

            digitIndex++;
        }

        return issn * 10 + control;
    }

    return {
        getModel: getModel,
        generateRandomPublication: generateRandomPublication
    };
}
