var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );
var Fs = require( 'fs' );
var IMG = require( '../../image_handle' );


/**
 * 静态图片路由
 * @param id item的id
 * @param title item的新title
 * @param desc
 * @param price
 * @param latlng
 * @param address
 * @param removeImgs 需要删除的图片 多个id以,隔开
 * @param addImgNum 新增的图片个数
 * @param pic1 新图片
 * @param pic2 新图片
 * @param pic3 新图片
 */
var img = {
    type: 'post',
    rule: '/updateitem',
//    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        var imgHandle = new DB.image();
        var itemHandle = new DB.item();
        var body = req.body;
        var auth = new Auth();
        var userInfo = auth.getAuthInfo( req );
        var ifError = false;

        var itemId = body.id;
        var title = body.title;
        var desc = body.desc;
        var price = parseFloat( body.price ) || undefined;
        var latlng = body.latlng;
        var address = body.address;
        var removeImgs = body.removeImgs ? body.removeImgs.split( ',' ) : [];
        var addImgs = ( [ body.pic1, body.pic2, body.pic3 ] ).splice( 0, body.addImgNum === undefined ? 0 : body.addImgNum );
        // 一共需要处理的图片数量
        var imgHandleLen = removeImgs.length + addImgs.length;
        var imgHandleCount = 0;

        // 构造用于更新的item object
        var updateObj = {
            title: title,
            desc: desc,
            price: price,
            location: latlng ? latlng.split( ',' ) : undefined,
            address: address
        };

        imgHandle.on( '_error', function ( msg, error ){

            ifError = true;
            API.send( req, res, {
                result: false,
                type: 'updateitem',
                error: msg,
                data: error
            });
        });

        itemHandle.on( '_error', function ( msg, error ){

            ifError = true;
            API.send( req, res, {
                result: false,
                type: 'updateitem',
                error: msg,
                data: error
            });
        });

        if( itemId ){

            // 先更新item数据
            itemHandle.update( itemId, updateObj, function ( item ){

                // 添加新图片
                addImgs.forEach(function ( imgData ){

                    IMG.base64Check( imgData, function ( err, path, ifValid, imgInfo ){

                        // 若已经出现过错误，则后面的都不处理
                        if( ifError === false ){

                            if( err ){

                                ifError = true;

                                API.send( req, res, {
                                    result: false,
                                    type: 'updateitem',
                                    error: '图片检验出错!',
                                    data: err
                                });
                            }
                            else {

                                // 若验证通过
                                if( ifValid ){

                                    // 图片的保存地址
                                    var newPath = 'uploads/' + userInfo.id + '_' + path.substring( 5 ) + Date.now() + '.' + imgInfo.type;

                                    // 图片另存为
                                    IMG.saveAs( path, newPath, function ( err ){

                                        if( !ifError ){

                                            if( err ){

                                                ifError = true;

                                                API.send( req, res, {
                                                    result: false,
                                                    type: 'newItem',
                                                    error: '图片保存失败!',
                                                    data: err
                                                });
                                            }
                                            else {

                                                // 构造新图片记录对象
                                                var newImg = {
                                                    path: newPath,
                                                    type: imgInfo.type,
                                                    mime: imgInfo.mimeType,
                                                    size: imgInfo.size
                                                };

                                                imgHandle.add( itemId, newImg, function ( img ){

                                                    if( ifError === false ){

                                                        imgHandleCount++;

                                                        if( imgHandleCount === imgHandleLen ){

                                                            API.send( req, res, {
                                                                result: true,
                                                                type: 'updateitem'
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });

                                }
                                else {

                                    // 图片检验未通过
                                    // todo 这里可以记录所有未通过的图片信息，然后和true的结果一起返回
                                    imgHandleCount++;

                                    if( imgHandleCount === imgHandleLen ){

                                        API.send( req, res, {
                                            result: true,
                                            type: 'updateitem'
                                        });
                                    }
                                }
                            }
                        }
                    });
                });

                // 删除旧图片
                removeImgs.forEach(function ( imgId ){

                    imgHandle.del( imgId, function (){

                        if( ifError === false ){

                            imgHandleCount++;

                            if( imgHandleCount === imgHandleLen ){

                                API.send( req, res, {
                                    result: true,
                                    type: 'updateitem'
                                });
                            }
                        }
                    });
                });

                // 若图片木有修改
                if( imgHandleCount === imgHandleLen ){

                    API.send( req, res, {
                        result: true,
                        type: 'updateitem'
                    });
                }
            });
        }
        else {

            ifError = true;

            API.send( req, res, {
                result: false,
                type: 'updateitem',
                error: '必须指定itemid'
            });
        }
    }
};

exports.rule = img;