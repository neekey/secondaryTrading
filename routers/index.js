
/*
 * GET home page.
 */

var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );
var MiddleWare = require( './middleware' );
var Router = require( './routers' );

module.exports = {
    init: function( app ){

        var rName, r, type, rule, handler, middleware, middlewareArr;

        for( rName in Router ){

            middlewareArr = [];
            r = Router[ rName ];
            type = r.type;
            rule = r.rule;
            handler = r.fn;
            middleware = r.middleware;

            if( typeof app[ type ] === 'function' ){

                _.each( middleware, function( md ){

                    if( md in MiddleWare ){
                        middlewareArr.push( MiddleWare[ md ] );
                    }
                });
                
                app[ type ]( rule, middlewareArr, handler );
            }
        }
    }
};



