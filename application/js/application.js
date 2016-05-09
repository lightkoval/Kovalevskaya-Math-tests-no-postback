/**
 * Created by s.kovalevskaya on 02.05.2016.
 */
    "use strict";

var application = angular.module("tms", ["ngRoute", /*"ui.bootstrap",*/ "tmsRouter", "tmsControllers", "validator"]);


function addOperation(settings) {
    var operations = [];
    if (settings.addition) operations.push(operationAddition);
    if (settings.subtraction) operations.push(operationSubtraction);
    if (settings.multiplication) operations.push(operationMultiplication);
    if (settings.division) operations.push(operationDivision);

    return operations;
}

function chooseOperation(operations) {
    return operations[Math.floor(Math.random() * operations.length)]();
}

function operationAddition() {
    var a, b, result;
    result = Math.floor(80 + Math.random() * 19);
    a = Math.floor(10 + Math.random() * 50);
    b = result - a;
    return {
        question: a +  " + " + b,
        result: result
    }
}

function operationSubtraction() {
    var a, b, result;
    result = Math.floor(1 + Math.random() * 49);
    b = Math.floor(50 + Math.random() * 49);
    a = result + b;
    return {
        question: a +  " - " + b,
        result: result
    }
}

function operationMultiplication() {
    var a, b, result;
    a = Math.floor(1 + Math.random() * 9);
    b = Math.floor(1 + Math.random() * 9);
    result = a * b;
    return {
        question: a +  " x " + b,
        result: result
    }
}

function operationDivision() {
    var a, b, result;
    b = Math.floor(1 + Math.random() * 9);
    result = Math.floor(1 + Math.random() * 9);
    a = b * result;
    return {
        question: a +  " / " + b,
        result: result
    }
}


