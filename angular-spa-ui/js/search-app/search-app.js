"use strict";

console.log('Hello world from search simple!');

var meta = require('reflect-metadata');
var angular = require('angular2/core');
var loader = require('angular2/bootstrap')

var Service = function () {};
Service.prototype.greeting = function () {
    return 'hello';
};


var search = function () {
    console.log('!!')
}

var search = angular.
Component({
        selector: 'my-app',
        appInjector: [Service]
    })
    .View({
        template: '<h1>Hello world</h1>'
    })
    .Class({
        constructor: [Service, function (service) {
            this.greeting = service.greeting();
    }]
    });


document.addEventListener("DOMContentLoaded", function () {
    loader.bootstrap(search);
})
