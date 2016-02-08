module.exports = function (app, mongoose, api) {

    var api = api;
    var tagModel = require('./Tag.js')(app, mongoose);
    var contentTagAssignmentModel = require('./ContentTagAssignment.js')(app, mongoose);

    /**
     * Returns all tags.
     */
    app.get('/service/tags', getAllTagsRequest);

    /**
     * Returns tag by name.
     *
     * ":tagName" - is a String full-name of the tag.
     */
    app.get('/service/tag/by-name/:tagName', getTagByNameRequest);

    /**
     * Returns tag by id.
     *
     * ":tagId" - is an Entity ID of Tag.
     */
    app.get('/service/tag/by-id/:tagId', getTagByIdRequest);

    /**
     * Creates a new tag with assignment if specified.
     *
     * The function works next way:
     * 1. Checks tag name. If tag with selected name already exists - it does not create a copy, it returns same tag.
     * 2. Checks assignment (assignment - is an Id of piece of content like article, publication or etc).
     *    If assignment specified the tag connects to the content.
     * 3. Return result object in any way:
     * {
     *  "tag": { tagEntity },
     *  "assignment": { assignmentEntity or null }
     * }
     *
     * Request fields:
     * {
     *  "assignmentId": "$entityId",    // String entity id (article, publication or other) that should be connected with the tag
     *  "name": "Sample tag",           // String name of tag
     *  "textColor": "#333",            // HEX color of the tags text
     *  "backgroundColor": "#AAA",      // HEX color of the tag background
     *  "glyph": "$important",          // String id of glyph type (unused)
     *  "published": "true",            // Boolean value of tags visibility (unpublished tags should be hidden)
     * }
     */
    app.post('/service/tag', createTagRequest);

    /**
     * Updates existing tag.
     *
     * See more in description of "createTagRequest" entry point (/service/tag).
     */
    app.put('/service/tag/:tagId', updateTagRequest);

    /**
     * Removes assignment betweet tag and content.
     */
    app.delete('/service/tag/unpin/:tagId/:contentId', unpinTagRequest);

    /**
     * Removes tag from ALL assigned content and deletes tag entity.
     */
    app.delete('/service/tag/:tagId', deleteTagRequest);

    /**
     * Pulls tags by list of contentIds. If you want to get tags from one content item - just send id of the content
     * in ":contentIds". If you are going to receive tags that assigned for multiple content items - write it as
     * list and divide ids by comma character (id1,id2,id3,id4,...,idn).
     */
    app.get('/service/tags/get-by-content/:contentIds', pullTagsByContentIdsRequest);

    /**
     * Implementation of autocomplete features
     */
    app.get('/service/tag/autocomplete/:arg', autocompleteTagRequest);

    function getTagByName(tagName, callback) {
        return tagModel.findOne({ name: tagName }, function (error, tag) {
            return callback(error, tag);
        });
    }

    function getTagById(tagId, callback) {
        return tagModel.findById(tagId, function (error, tag) {
            return callback(error, tag);
        });
    }

    function getAllTags(callback) {
        return tagModel.find({}, function (error, tags) {
            return callback(error, tags);
        });
    }

    function getTagsByIds(tagIdsArray, callback) {
        return tagModel.find(
            {
                _id: {
                    '$in': tagIdsArray
                }
            },
            function (error, tags) {
                return callback(error, tags);
            }
        );
    }

    function createTag(tagData, callback) {
        return getTagByName(tagData.name, function (error, data) {
            if (error) {
                return callback(error, null);
            }

            if (data != null) {
                return callback(error, data);
            }

            var tag = new tagModel(tagData);

            tag.save(function (savingError) {
                return callback(savingError, tag);
            })
        });
    }

    function updateTag(tagId, tagData, callback) {
        return tagModel.update({ _id: tagId}, tagData, function (error, tag) {
            if (error) {
                return callback(error, tag);
            }

            return tagModel.findById(tagId, function (getTagError, updatedTag) {
                return callback(getTagError, updatedTag);
            });
        });
    }

    function getTagAssignment(tagId, contentId, callback) {
        return contentTagAssignmentModel.findOne(
            {
                tagId: tagId,
                contentId: contentId
            },
            function (error, assignment) {
                return callback(error, assignment);
            }
        );
    }

    function getTagAssignmentsForContent(contentIds, callback) {
        return contentTagAssignmentModel.find(
            {
                contentId: {
                    '$in': contentIds
                }
            },
            function (error, tagAssignments) {
                return callback(error, tagAssignments);
            }
        );
    }

    function getTagAssignmentsForTag(tagId, callback) {
        return contentTagAssignmentModel.find({ tagId: tagId }, function (error, tagAssignments) {
            return callback(error, tagAssignments);
        });
    }

    function assignTag(tag, assignmentId, callback) {
        if (tag == null) {
            return callback('Tag is empty', null);
        }

        if (assignmentId == null) {
            return callback('Assignment is empty', null);
        }

        var searchData = {
            'tagId': tag._id,
            'contentId': assignmentId
        };

        return getTagAssignment(
            searchData.tagId,
            searchData.contentId,
            function (error, existingAssignment) {
                if (error || existingAssignment != null) {
                    return  callback(error, existingAssignment);
                }

                var newAssignment = new contentTagAssignmentModel(searchData);

                newAssignment.save(function (savingError) {
                    return callback(savingError, newAssignment);
                });
            }
        );
    }

    function removeTagAssignment(id, callback) {
        contentTagAssignmentModel.remove({ _id: id }, function (error) {
            callback(error);
        });
    }

    function removeTag(tagId, callback) {
        tagModel.remove({ _id: tagId }, function (error) {
            callback(error);
        });
    }

    function extractTagIdsFromAssignments(assignments) {
        var tagIds = [];

        for (var assignemntIndex = 0; assignemntIndex < assignments.length; assignemntIndex++) {
            tagIds.push(assignments[assignemntIndex].tagId);
        }

        return tagIds;
    }

    function getTagDataFromRequest(request) {
        return {
            'assignmentId': _getReqBodyFieldValue(request.body, 'assignmentId', null),
            'name': _getReqBodyFieldValue(request.body, 'name', 'Unnamed'),
            'textColor': _getReqBodyFieldValue(request.body, 'textColor', '#000'),
            'backgroundColor': _getReqBodyFieldValue(request.body, 'backgroundColor', '#EEE'),
            'glyph': _getReqBodyFieldValue(request.body, 'glyph', 'none'),
            'published': _getReqBodyFieldValue(request.body, 'published', true)
        };
    }

    function pullTagsByContentIdsRequest(request, response) {
        var operationName = 'pull tags by content items';
        var contentIds = request.params.contentIds.split(',');

        return getTagAssignmentsForContent(contentIds, function (error, tagAssignments) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            var tagIds = extractTagIdsFromAssignments(tagAssignments);

            if (tagIds.length == 0) {
                return response.send(api.generateResponseObject(operationName, 'ok', null, {}));
            }

            getTagsByIds(tagIds, function (tagsListError, tags) {
                if (tagsListError) {
                    return response.send(api.generateResponseObject(operationName, 'error', tagsListError));
                }

                return response.send(api.generateResponseObject(operationName, 'ok', null, tags));
            });
        });
    }

    function unpinTagRequest(request, response) {
        var operationName = 'unpin tag from content';
        var tagId = request.params.tagId;
        var contentId = request.params.contentId;

        return getTagAssignment(tagId, contentId, function (error, assignment) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            removeTagAssignment(assignment._id, function (error) {
                if (error) {
                    return response.send(api.generateResponseObject(operationName, 'error', error));
                }

                return response.send(api.generateResponseObject(operationName, 'ok', null, {}));
            });
        });
    }

    function deleteTagRequest(request, response) {
        var operationName = 'delete tag and assignments';
        var tagId = request.params.tagId;

        getTagAssignmentsForTag(tagId, function (error, tagAssignments) {
            var assignmentsRemoved = 0;

            for (var tagAssignmentIndex = 0; tagAssignmentIndex < tagAssignments.length; tagAssignmentIndex++) {
                removeTagAssignment(tagAssignments[tagAssignmentIndex]._id, function () {
                    assignmentsRemoved++;
                });
            }

            removeTag(tagId, function (error) {
                if (error) {
                    return response.send(api.generateResponseObject(operationName, 'error', error));
                }

                var responseObject = {
                    'oldAssignments': tagAssignments,
                    'assignmentsRemoved': assignmentsRemoved
                }

                return response.send(api.generateResponseObject(operationName, 'ok', null, responseObject));
            });
        });
    }

    function autocompleteTagRequest(request, response) {
        var searchQuery = request.params.arg.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        var searchRegEx = new RegExp('^' + searchQuery, 'i');

        return model.find().or([ { name: searchRegEx } ]).sort('name').limit(10).exec(function (error, data) {
            response.json(JSON.stringify(data));
        });
    }

    function getAllTagsRequest(request, response) {
        var operationName = 'get tags';

        return getAllTags(function (error, tags) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            return response.send(api.generateResponseObject(operationName, 'ok', null, tags));
        });
    }

    function getTagByNameRequest(request, response) {
        var operationName = 'get tag by name';
        var tagName = request.params.tagName;

        return getTagByName(tagName, function (error, tag) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            return response.send(api.generateResponseObject(operationName, 'ok', null, tag));
        });
    }

    function getTagByIdRequest(request, response) {
        var operationName = 'get tag by id';
        var tagId = request.params.tagId;

        return getTagById(tagId, function (error, data) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            return response.send(api.generateResponseObject(operationName, 'ok', null, tag));
        });
    }

    function createTagRequest(request, response) {
        var operationName = 'create tag';
        var tagData = getTagDataFromRequest(request);

        createTag(tagData, function (error, tag) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            assignTag(tag, tagData.assignmentId, function (assignmentError, assignment) {
                if (assignmentError) {
                    return response.send(api.generateResponseObject(operationName, 'error', assignmentError));
                }

                var responseObject = {
                    'tag': tag,
                    'assignment': assignment
                };

                return response.send(api.generateResponseObject(operationName, 'ok', null, responseObject));
            });
        });
    }

    function updateTagRequest(request, response) {
        var operationName = 'update tag';
        var tagId = request.params.tagId;

        if (tagId == null) {
            return response.send(api.generateResponseObject(operationName, 'error', 'No tagId specified for updating'));
        }

        var tagData = getTagDataFromRequest(request);

        updateTag(tagId, tagData, function (error, tag) {
            if (error) {
                return response.send(api.generateResponseObject(operationName, 'error', error));
            }

            return response.send(api.generateResponseObject(operationName, 'ok', null, tag));
        });
    }

    function _getReqBodyFieldValue(requestBody, fieldName, defaultValue) {
        if (defaultValue == undefined) {
            defaultValue = null;
        }

        return (requestBody[fieldName] != undefined)
            ? requestBody[fieldName]
            : defaultValue;
    }

    // Helper functions
    // ----------------
    function getModel() {
        return model;
    }

    function getContentTagAssignmentModel() {
        return contentTagAssignmentModel;
    }

    return {
        getModel: getModel,
        getContentTagAssignmentModel: getContentTagAssignmentModel
    };
}
