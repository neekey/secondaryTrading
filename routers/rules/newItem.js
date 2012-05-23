var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );
var IMG = require( '../../image_handle' );

/**
 * @param title 商品标题
 * @param desc 商品描述
 * @param price 商品价格
 * @param latlng 商品地理位置坐标 latitude,longitude
 * @param address 商品地址文字描述
 * @param category 商品类别（一个） 字符串
 * @param pic1 新图片
 * @param pic2 新图片
 * @param pic3 新图片
 */
var newItem = {
    type: 'post',
    rule: '/newItem',
    middleware: [ 'shouldLogin' ],
    fn: function ( req, res ){

        var newImg = new DB.image();
        var newItem = new DB.item();
        var body = req.body;
        var auth = new Auth();
        var userInfo = auth.getAuthInfo( req );

        var title = body.title;
        var desc = body.desc;
        var price = parseFloat( body.price ) || 0;
        var latlng = body.latlng;
        var address = body.address;
        var category = body.category;
        var pics = [];

        var i, dataString, ifError = false, picCheckCount = 0;

        newImg.on( '_error', function( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'newItem',
                error: msg,
                data: error
            });
        });

        newItem.on( '_error', function( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'newItem',
                error: msg,
                data: error
            });
        });

        // 检查图片
        for( i = 1; i <= 3; i++ ){

            if( dataString = body[ 'pic' + i ] ){

                (function( index, ds ){

                    // 检查
                    IMG.base64Check( ds, function ( err, path, ifValid, imgInfo ){

                        // 若已经出现过错误，则后面的都不处理
                        if( ifError ){
                            return;
                        }

                        if( err ){

                            API.send( req, res, {
                                result: false,
                                type: 'newItem',
                                error: '图片检验失败!',
                                data: err
                            });

                            ifError = true;
                        }
                        else {

                            // 若验证通过
                            if( ifValid ){

                                // 图片的保存地址
                                var newPath = 'uploads/' + userInfo.id + '_' + path.substring( 5 ) + Date.now() + '.' + imgInfo.type;

                                // 图片另存为
                                IMG.saveAs( path, newPath, function ( err ){

                                    if( ifError ){

                                        return;
                                    }

                                    picCheckCount++;

                                    if( err ){

                                        API.send( req, res, {
                                            result: false,
                                            type: 'newItem',
                                            error: '图片保存失败!',
                                            data: err
                                        });

                                        ifError = true;

                                    }
                                    else {

                                        pics[ index ] = {
                                            path: newPath,
                                            type: imgInfo.type,
                                            mime: imgInfo.mimeType,
                                            size: imgInfo.size
                                        };

                                        if( picCheckCount === 3 ){

                                            addItem();
                                        }
                                    }
                                });

                            }
                            else {

                                picCheckCount++;

                                if( picCheckCount === 3 ){

                                    addItem();
                                }
                            }
                        }
                    });
                })( i, dataString );
            }
            else {

                picCheckCount++;

                if( picCheckCount === 3 ){

                    addItem();
                }
            }

        }

        // 添加新商品
        function addItem(){

            var userId = userInfo.id;
            var count = 0;
            var location = latlng ? latlng.split( ',' ) : undefined;
            var i, pic;

            // 如果location给定了，则转化为数字
            if( location ){

                location = [ parseFloat( location[ 0 ]), parseFloat( location[ 1 ] ) ];
            }

            // 新建商品
            newItem.add( userId, {
                title: title,
                desc: desc,
                price: price,
                location: location,
                address: address,
                category: category
            }, function ( newItem ){

                var itemId = newItem.id;

                if( count === pics.length ){

                    addItemSuccess( itemId );
                }
                else {

                    for( i = 0; i < pics.length; i++ ){

                        pic = pics[ i ];

                        if( pic ){
                            newImg.add( itemId, pic, function ( newImg ){

                                count++;

                                if( count === pics.length ){

                                    addItemSuccess( itemId );
                                }
                            });
                        }
                        else {

                            count++;

                            if( count === pics.length ){

                                addItemSuccess( itemId );
                            }
                        }
                    }
                }

            })

        }

        function addItemSuccess( itemId ){

            API.send( req, res, {
                result: true,
                type: 'newItem',
                data: {
                    itemId: itemId
                }
            });
        }
    }
};

exports.rule = newItem;