var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

/**
 * 静态图片路由
 * @param id 图片的id
 * @type {Object}
 */
var img = {
    type: 'get',
    rule: '/img',
//    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        var data = req.query;
        var imgId = data.id;
        var Img = new DB.image();

        Img.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'img',
                error: msg,
                data: error
            });
        });

        if( imgId ){

            Img.getById( imgId, function ( img ){

                res.sendfile( img.path );
            });
        }
        else {

            API.send( req, res, {
                result: false,
                type: 'img',
                error: '必须指定图片id'
            });
        }
    }
};

exports.rule = img;