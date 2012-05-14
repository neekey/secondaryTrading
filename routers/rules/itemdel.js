var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );
var Fs = require( 'fs' );

/**
 * 静态图片路由
 * @param id item的id
 */
var img = {
    type: 'get',
    rule: '/itemdel',
//    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        var data = req.query;
        var itemId = data.id;
        var imgHandle = new DB.image();
        var itemHandle = new DB.item();
        var imgUnlinkCount = 0;
        var imgLen = 0;
        var ifError = false;

        console.log( 'itemId', itemId );
        imgHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'itemdel',
                error: msg,
                data: error
            });
        });

        itemHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'itemdel',
                error: msg,
                data: error
            });
        });

        if( itemId ){

            // 先删除item
            itemHandle.del( itemId, function (){

                // 删除item对应的所有图片记录
                imgHandle.delByItemId( itemId, function ( imgs ){

                    imgLen = imgs.length;

                    // 在磁盘中删除掉这些图片
                    imgs.forEach( function ( img ){

                        Fs.unlink( img.path, function ( err ){

                            imgUnlinkCount++;

                            if( ifError === false ){

                                if( err ){

                                    ifError = true;

                                    API.send( req, res, {
                                        result: false,
                                        type: 'itemdel',
                                        error: '图片文件删除失败!',
                                        data: err
                                    });
                                }
                                else {

                                    // 终于所有操作都成功了!
                                    if( imgLen === imgUnlinkCount ){

                                        API.send( req, res, {
                                            result: true,
                                            type: 'itemdel',
                                            data: {}
                                        });
                                    }
                                }

                            }

                        });

                    });

                    // 终于所有操作都成功了!
                    if( imgLen === imgUnlinkCount ){

                        API.send( req, res, {
                            result: true,
                            type: 'itemdel',
                            data: {}
                        });
                    }
                });
            });
        }
        else {

            API.send( req, res, {
                result: false,
                type: 'itemdel',
                error: '必须指定itemid'
            });
        }
    }
};

exports.rule = img;