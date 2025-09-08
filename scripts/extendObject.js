// Extend an existing object with a method from another
// Useful when an object must inherit from multiple objects (mixin pattern)
Object.prototype.augment = function(givingClass ) {
    // only provide certain methods
    if ( arguments[1] ) {
        for ( var i = 1, len = arguments.length; i < len; i++ ) {
            this.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    }
    // provide all methods
    else {
        for ( var methodName in givingClass.prototype ) {
 
            // check to make sure the receiving class doesn't
            // have a method of the same name as the one currently
            // being processed
            if ( !this.hasOwnProperty(methodName) ) {
                this.prototype[methodName] = givingClass.prototype[methodName];
            }
 
            // Alternatively (check prototype chain as well):
            // if ( !receivingClass.prototype[methodName] ) {
            // receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            // }
        }
    }
}
