
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

            var data = req.query;
            var email = data.email;
            var password = data.password;
            var options = data.options;

            // 监听抛出的错误
            DB.user.on( '_error', function( error ){

                API.send( req, res, {
                    result: false,
                    type: 'register',
                    error: 'register failed',
                    data: error
                });
            });

            // 添加用户
            DB.user.add( email, password, options, function( user ){

                API.send( req, res, {
                    result: true,
                    type: 'register',
                    data: user
                });
            });
        }
    }
};