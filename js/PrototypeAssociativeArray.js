"use strict";

function AssociativeArray(){
    this.keys   = [];
    this.values = [];
}

AssociativeArray.prototype.setValue = function(key, value){
    var index = this.keys.indexOf(key);
    if (index === -1){
        this.keys.push(key);
        this.values.push(value);
    }
    else
        this.values[index] = value;

}

AssociativeArray.prototype.getValue = function(key){
    var index = this.keys.indexOf(key);
    if (index === -1)
        return null;
    else
        return this.values[index];
}

AssociativeArray.prototype.length = function(){
    return this.keys.length;
}
