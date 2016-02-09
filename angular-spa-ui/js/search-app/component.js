'use strict'

var innDir = require('./innDir');

var component =
    ng.core.Component({
        selector: '[my-app]',
        template: '<h1>My First Angular 2 App {{myName}}</h1><indir></indir>',
        directives:[innDir]
    })
    .Class({
        constructor: function () {
            this.myName = "Alice";
        }
    })

module.exports = component;
