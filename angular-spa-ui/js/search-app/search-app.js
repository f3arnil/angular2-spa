"use strict";

console.log('Hello world from search simple!');

var angular = require('angular2/core');
console.log(angular)
var AppComponent = require('./component');

//function TodoList() {
//  this.todos = ["Eat Breakfast", "Walk Dog", "Breathe"];
//  this.addTodo = function(todo) {
//    this.todos.push(todo.value);
//  };
//  this.doneTyping = function($event) {
//    if($event.which === 13) {
//      this.addTodo($event.target.value);
//      $event.target.value = null;
//    }
//  }
//}
//TodoList.annotations = [
//  new angular.ComponentAnnotation({
//    selector: "todo-list"
//  }),
//  new angular.ViewAnnotation({
//    template:
//      '<ul>' +
//      '<li *ng-for="#todo of todos">' +
//      '{{ todo }}' +
//      '</li>' +
//      '</ul>' +
//      '<input #textbox (keyup)="doneTyping($event)">' +
//      '<button (click)="addTodo(textbox.value)">Add Todo</button>',
//    directives: [angular.NgFor]
//  })
//];


document.addEventListener('DOMContentLoaded', function () {
    ng.platform.browser.bootstrap(AppComponent);
});
