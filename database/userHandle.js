/**
 * 对用户的操作
 */
require( './user' );

var _ = require( 'underscore' ),
    Util = require('util'),
    mongoose = require( 'mongoose' ),
    User = mongoose.model( 'user' ),
    EventEmitter = require('events').EventEmitter;

var userOptions = [ 'sex', 'location', 'cellphone', 'qq', 'wangwang' ];

var userHandle = function(){

    EventEmitter.call( this );
};

Util.inherits( userHandle, EventEmitter );

_.extend( userHandle.prototype, {

    /**
     * 添加新用户
     * @param email
     * @param password
     * @param options {
     *      sex:,
     *      location,
     *      qq:,
     *      wangwang:,
     *      cellphone:
     * }
     * @param next
     */
    add: function( email, password, options, next ){

        var that = this;

        if( typeof options === 'function' ){

            next = options;
            options = null;
        }

        var newUserModel = {
            email: email,
            password: password
        }, newUser;

        if( options ){
            _.each( userOptions, function( op ){

                if( op in options ){

                    newUserModel[ op ] = options[ op ];
                }
            });
        }

        newUser = new User( newUserModel );

        newUser.save( function( err ){
            if( err ){

                return that.emit( '_error', 'user add failed!', err  );
            }
            else {
                return next( newUser );
            }
        });
    },

    /**
     * 利用email来获取用户
     * @param email
     */
    get: function( email, next ){

        User.findOne( { email: email }, function( err, user ){

            if( err ){
                return this.emit( 'error', err, 'user with email:' + email + 'not found' );
            }
            else {
                return next( user );
            }
        });
    }
});


module.exports = userHandle;

