module.exports = function (app, mongoose,api) {

    var api = api;
    var model = require('./Article.js')(app, mongoose);

    // Routes list
    // -----------
    app.get('/service/article/:id', getArticleRequest);
    app.get('/search/article/:searchQuery', searchArticleRequest);
    app.get('/generate/article/:number', generateRandomArticlesRequest);

    // Routes implementation
    // ---------------------
    function getArticleRequest(request, response) {
        var operationName = 'get article';
        var articleId = request.params.id;

        model.findById(articleId, function (error, data) {
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

    function searchArticleRequest(request, response) {
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

    function generateRandomArticlesRequest(request, response) {
        var numberOfArticles = parseInt(request.params.number);
        var articlesCreated = 0;

        if (numberOfArticles < 0) {
            numberOfArticles = 1;
        }
        else if (numberOfArticles > 100) {
            numberOfArticles = 100;
        }

        for (var i = 0; i < numberOfArticles; i++) {
            var article = generateRandomArticle();

            article.save(function (error) {
                if (error) {
                    console.log('Could not to save an random article');
                }
            });

            if (article._id != undefined) {
                articlesCreated++;
            }
        }

        return response.send(
            api.generateResponseObject(
                'create random article',
                (articlesCreated > 0) ? 'ok' : 'error',
                (articlesCreated > 0) ? null : 'No articles has been created',
                { articlesCreated: articlesCreated }
            )
        );
    }

    // Helper functions
    // ----------------
    function getModel() {
        return model;
    }

    function generateRandomArticle() {
        var publication = new model({
            title: 'Random article [' + Math.floor(Math.random() * 1000000000) + ']',
            description: 'That is a description of an article...',
            content: 'That is a long text... Really... Loooooong...',
            language: 'en',
            author: process.env.NODE_USER_ID || '#article-bot',
            published: true,
        });

        return publication;
    }

    return {
        getModel: getModel,
        generateRandomArticle: generateRandomArticle
    };
}
