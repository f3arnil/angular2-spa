'use strict'

import {
    Component, Injectable, Inject
}
from 'angular2/core';
import {
    HTTP_PROVIDERS
}
from 'angular2/http';
import {
    Observable
}
from 'rxjs/Rx';

import {
    TestService
}
from './test_service'

@
Component({
    selector: '[my-app]',
    providers: [TestService, HTTP_PROVIDERS],
    template: require("html!./test.html")
})

export class App {
    constructor(_testService: TestService) {
        this.firstName = 'Alex';
        _testService.getUserData()
            .then((res) => {
                console.log(res);
                this.result = JSON.stringify(res);
            });
    }

    doSomething(res) {
        this.result = JSON.stringify(res);
        console.log(res);
    }
}
