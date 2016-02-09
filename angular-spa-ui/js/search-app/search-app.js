"use strict";

console.log('Hello world from search simple!');

var AppComponent = require('./component');

var app = {};
app.AppComponent = AppComponent;

document.addEventListener('DOMContentLoaded', function () {
    ng.platform.browser.bootstrap(app.AppComponent);
});
