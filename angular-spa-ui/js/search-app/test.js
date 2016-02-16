'use strict'

import {Component, Injectable, Inject} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

export class App {
    static get parameters() {
        return [[Http]];
    }
    
    constructor(http) {
        this.heroesUrl = '/user/' + GLOBAL_USER_ID;
        this.firstName = 'Alex';
        http.get(this.heroesUrl)
            .map(res => res.json())
            .subscribe((res) => this.doSomething(res));
    }
    
    doSomething (res) {
        this.result = JSON.stringify(res);
        console.log(res);
  }
};

App.annotations = [
    new Component({
        selector: '[my-app]',
        providers: [ HTTP_PROVIDERS ],
        template: '<h1>not My First Angular 2 App by {{ firstName }}</h1><input [(ngModel)]="firstName"><pre>{{result}}</pre>'
    })
];


//@Component({
//    selector: '[my-app]',
//    viewProviders: [HTTP_PROVIDERS],
//    template: '<h1>My First Angular 2 App by {{ firstName }}</h1><input [(ngModel)]="firstName"><pre>{{result}}</pre>'
//})
//
//export class App {
//    constructor(http: Http) {
//        this.heroesUrl = '/user/' + GLOBAL_USER_ID;
//        console.log(this.heroesUrl);
//        this.firstName = 'Alex';
//        http.get(this.heroesUrl)
//            .map(res => res.json())
//            .subscribe((res:Response) => this.doSomething(res));
//        console.log('lst');
//    }
//    
//    doSomething (res) {
//        this.result = JSON.stringify(res);
//        console.log(res);
//  }
//}