/**
 * 对用户的操作
 */
require( './user' );

var _ = require( 'underscore' ),
    mongoose = require( 'mongoose' ),
    User = mongoose.model( 'user' ),
    EventEmitter = require('events').EventEmitter;

    userOptions = [ 'sex', 'location', 'cellphone', 'qq', 'wangwang' ];

userHandle = function(){

    EventEmitter.call( this );
};
userHandle.prototype = {

    add: function( email, password, options, next ){

        var newUserModel = {
            email: email,
            password: password
        }, newUser;

        _.each( userOptions, function( op ){

            if( op in options ){

                newUserModel[ op ] = options[ op ];
            }
        });

        newUser = new User( newUserModel );

        newUser.save( function( err ){
            if( err ){
                return this.emit( 'error', err, 'user add failed!' );
            }
            else {
                next();
            }
        });
    }
};

module.exports = new userHandle;

