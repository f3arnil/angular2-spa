import {
    Injectable
}
from 'angular2/core';
import {
    Http
}
from 'angular2/http';
import {
    Observable
}
from 'rxjs/Rx';

@
Injectable()
export class TestService {
    constructor(http: Http) {
        this.http = http;
    }

    getUserData() {
        this.heroesUrl = '/user/' + GLOBAL_USER_ID;
        return this.http.get(this.heroesUrl)
            .map( res => res.json() )
            .toPromise();
    }
}
