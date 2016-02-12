'use strict'

import {
    Component, View, NgFor
}
from 'angular2/core';

class PublicPage {

    constructor() {
        this.firstName = 'Edvard';
        this.name = 'Caramba Man';
        this.heroImageUrl = 'gflkdjshfg';
        this.names = ["Aarav", "Martín", "Shannon", "Ariana", "Kai"];
    }

    changeName(name) {
        console.log(this.firstName);
        this.firstName = name;
        console.log(this.firstName);
    }
    changeUrl(name) {
        console.log(this.heroImageUrl);
        this.heroImageUrl = name;
        console.log(this.heroImageUrl);
    }
}

PublicPage.annotations = [
    new Component({
        selector: '[my-app]',
        directives:[NgFor]
    }),
    new View({
        template: '<input [(ngModel)]="firstName"><button (click)="changeName(\'Steve\')">Add Todo</button><h1>My First Angular 2 App by {{ firstName }} - {{name}}</h1><img [(src)] = "heroImageUrl" (click)="changeUrl(\'Steve\')"><p>Friends:</p><ul><li *ng-for="#name of names">{{name}}</li></ul>'
    })
];

export default PublicPage
