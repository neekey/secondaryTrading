
/*
 * GET home page.
 */

var DB = require( '../database/' ),
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

            API.send( req, res, { result: true, type: 'register', data: { neekey: 'test' }, error: 'no error' } );

            /*
            DB.user.add( email, password, {}, function(){

                res.send( 'register success' );
            });

            DB.user.on( 'error', function(){

                res.send( 'register failed!' );
            });
            */
        }
    }
};