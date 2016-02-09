var component =
    ng.core.Component({
        selector: 'indir',
        template: '<h2>My in dir with {{myName}}</h2>'
    })
    .Class({
        constructor: function () {
            this.myName = "Alex";
            console.log('!!!')
        }
    })
//'<h2>My in dir with {{myName}}</h2>'
//console.log(require('./search-module/templates/search.html'))
module.exports = component;
