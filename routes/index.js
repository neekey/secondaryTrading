
/*
 * GET home page.
 */

var db = require( '../database/index' ),
    API = require( '../api/api.js' );

module.exports = {
    init: function( app ){

        var rName, r, type, rule, handler;

        for( rName in Router ){

            r = Router[ rName ];
            type = r.type;
            rule = r.rule;
            handler = r.fn;

            if( typeof app[ type ] === 'function' ){

                app[ type ]( rule, handler );
            }
        }
    }
};

var Router ={
    index: {
        type: 'get',
        rule: '/',
        fn: function(req, res){
            // res.render('index', { title: 'Express' })
            res.send( 'index' );
        }
    },

    register: {
        type: 'get',
        rule: '/register',
        fn: function( req, res ){

            var data = req.query,
                email = data.email,
                password = data.password,
                callback = data.callback;

            //res.send( 'register' );
            API.send( req, res, { result: true, type: 'register', data: { neekey: 'test' }, error: 'no error' } );

            /*
            db.user.add( email, password, {}, function(){

                res.send( 'register success' );
            });

            db.user.on( 'error', function(){

                res.send( 'register failed!' );
            });
            */
        }
    }
};