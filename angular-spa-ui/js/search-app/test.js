'use strict'

import {Component} from 'angular2/core';

@Component({
    selector: '[my-app]',
    template: '<h1>My First Angular 2 App by {{ firstName }}</h1><input [(ngModel)]="firstName">'
})

export class App {
    constructor(){
        this.firstName = 'Alex';
    }
}


