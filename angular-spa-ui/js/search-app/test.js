'use strict'

import {Component, Injector, provide} from 'angular2/core';
import {Injectable} from 'angular2/core'
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

@
Component({
    selector: '[my-app]',
    viewProviders: [HTTP_PROVIDERS],
    template: '<h1>My First Angular 2 App by {{ firstName }}</h1><input [(ngModel)]="firstName"><pre>{{result}}</pre>'
})

export class App {
    constructor(http: Http) {
        this.heroesUrl = '/user/' + GLOBAL_USER_ID;
        console.log(this.heroesUrl);
        this.firstName = 'Alex';
        http.get(this.heroesUrl)
            .map(res => res.json())
            .subscribe((res:Response) => this.doSomething(res));
        console.log('lst');
    }
    
    doSomething (res) {
        this.result = JSON.stringify(res);
        console.log(res);
  }
}

//Injectable()
//export class App2 {
//    constructor(http) {
//        this.heroesUrl = '/user/' + GLOBAL_USER_ID;
//        console.log(this.heroesUrl);
//        this.firstName = 'Alex';
//        http.get(this.heroesUrl)
//            .map(res => res.json())
//            .subscribe((res) => this.doSomething(res));
//        console.log('lst');
//    }
//    
//    doSomething (res) {
//        this.result = JSON.stringify(res);
//        console.log(res);
//  }
//};
//
//App2.annotations = [
//    new Component({
//        selector: '[my-app]',
//        viewProviders: [HTTP_PROVIDERS],
//        template: '<h1>not My First Angular 2 App by {{ firstName }}</h1><input [(ngModel)]="firstName"><pre>{{result}}</pre>'
//    })
//];
//
//var injector = Injector.resolveAndCreate([
// provide("http", {useClass: Http}),
// App2
//]);
