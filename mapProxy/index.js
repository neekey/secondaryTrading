/**
 *  对于google map api的代理
 *  将请求的形式转化为jsonp
 */

var HTTP = require( 'http' );
var APIS = require( './config' );

var Map = {

    attachParam: function( path, param ){

        var key;
        var hasAnd = false;
        var isEndAnd = false;

        if( path.indexOf( '?' ) < 0 ){

            path += '?';
        }
        if( path.indexOf( '&' ) >= 0 ){
            
            hasAnd = true;
        }
        if( path[ path.length - 1 ] === '&' ){

            isEndAnd = true;
        }

        if( !isEndAnd && hasAnd ){

            path += '&';
        }

        for( key in param ){

            path += encodeURIComponent( key ) + '=' + encodeURIComponent( param[ key ] ) + '&';
        }

        return path;
    },
    geo: function( param, next ){

        var options = APIS[ 'geo' ];
        //options.path = this.attachParam( options.path, param );

        console.log( options );
        HTTP.get( options, function( res ){
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        });
    }
};

module.exports = Map;

