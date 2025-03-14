---
title: JS继承
sidebar: 'auto'
date: 2018-12-01
author: Issho Lin
tags:
 - 基础
categories:
 - Javascript
---

## 原型链继承
```js
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {}
SubType.prototype = new SuperType()
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // lin
```

## 构造函数继承
```js
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {
    SuperType.call(this)
}
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // Uncaught TypeError: sub.sayName is not a function
```

## 组合继承
```js
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {
    SuperType.call(this)
}
SubType.prototype = new SuperType()
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // lin
```

## 原型式继承
```js
function object(o) {
    const F = function() {}
    F.prototype = o
    return new F()
}
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {}
SubType.prototype = object(new SuperType())
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // lin
```

## 寄生式继承
```js
function object(o) {
    const F = function() {}
    F.prototype = o
    return new F()
}
function inherit(o) {
    const clone = object(o)
    clone.run = function() {
        console.log('running')
    }
    return clone
}
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {}
SubType.prototype = inherit(new SuperType())
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // lin
sub.run() // running
```
## <font color="#ff0000">重点！！！寄生组合继承</font>
```js
function SuperType() {
    this.name = 'lin'
}
SuperType.prototype.sayName = function() {
    console.log(this.name)
}
function SubType() {
    SuperType.call(this)
}
function object(o) {
    const F = function() {}
    F.prototype = o
    return new F()
}
function inherit(Sub, Super) {
    const prototype = object(Super.prototype)
    prototype.constructor = Sub
    Sub.prototype = prototype
}
inherit(SubType, SuperType)
const sub = new SubType()
console.log(sub.name) // lin
sub.sayName() // lin
```