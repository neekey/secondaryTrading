var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );
var FS = require( 'fs' );
var IMG = require( '../image_handle' );
var Router ={
    index: {
        type: 'get',
        rule: '/',
        fn: function(req, res){

            var auth = new Auth();

            res.send( auth.ifLogin( req, res ) );
        }
    },

    // 用于为客户端部分文件建立静态服务器
    // 在同目录下，同域名下，解决在浏览器端调试的跨域问题
    clientStatic: require( './clientStatic').clientStatic,

    /**
     * 用户登陆
     */
    login: {
        type: 'get',
        rule: '/login',
        middleware: [ 'shouldNotLogin' ],
        fn: function( req, res ){

            var auth = new Auth();

            var data = req.query;
            var email = data.email;
            var password = data.password;
            var options = data.options;

            auth.on( '_error', function( msg, error ){
                API.send( req, res, {
                    result: false,
                    type: 'login',
                    error: msg
                });
            });

            auth.login( req, res, email, password, function(){
                API.send( req, res, {
                    result: true,
                    type: 'login'
                });
            });
        }
    },

    /**
     * 注销
     */
    logout: {
        type: 'get',
        rule: '/logout',
        middleware: [ 'shouldLogin' ],
        fn: function( req, res ){
            var auth = new Auth();

            auth.logout( req, res );

            API.send( req, res, {
                result: true,
                type: 'logout'
            });
        }
    },

    /**
     * 检查用户是否已经登陆
     */
    checkAuth: {
        type: 'get',
        rule: '/checkauth',
        fn: function( req, res ){
            var auth = new Auth();

            if( auth.ifLogin( req, res ) ){

                API.send( req, res, {
                    result: true,
                    type: 'checkauth',
                    data: true
                });
            }
            else {

                API.send( req, res, {
                    result: true,
                    type: 'checkauth',
                    data: false
                });
            }
        }
    },

    /**
     * 注册新用户
     */
    register: {
        type: 'get',
        rule: '/register',
        middleware: [ 'shouldNotLogin' ],
        fn: function( req, res ){

            var User = new DB.user();

            var data = req.query;
            var email = data.email;
            var password = data.password;
            var options = data.options;

            // 监听抛出的错误
            User.on( '_error', function( msg, error ){

                API.send( req, res, {
                    result: false,
                    type: 'register',
                    error: msg,
                    data: error
                });
            });

            // 添加用户
            User.add( email, password, options, function( user ){

                API.send( req, res, {
                    result: true,
                    type: 'register',
                    data: user
                });
            });
        }
    },

    /**
     * 添加新商品
     */
    newItem: {
        type: 'post',
        rule: '/newItem',
        middleware: [ 'shouldLogin' ],
        fn: function ( req, res ){

            console.log( 'begin newItem' );
            var newImg = new DB.image();
            var newItem = new DB.item();
            var body = req.body;

            console.log( 'body:', body );

            var title = body.title;
            var desc = body.desc;
            var price = parseFloat( body.price ) || 0;
            var latlng = body.latlng;
            var address = body.address;
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
                                    error: 'error when checking image!',
                                    data: err
                                });

                                ifError = true;
                            }
                            else {

                                // 若验证通过
                                if( ifValid ){

                                    // 图片的保存地址
                                    // todo 增加时间戳和用户信息
                                    var newPath = 'uploads/' + path.substring( 5 ) + '.' + imgInfo.type;

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
                                                error: 'error when saving image!',
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

                                                console.log( 'before additem' );
                                                addItem();
                                            }
                                        }
                                    });

                                }
                                else {

                                    picCheckCount++;

                                    if( picCheckCount === 3 ){

                                        console.log( 'before additem' );
                                        addItem();
                                    }
                                }
                            }
                        });
                    })( i, dataString );
                }
                else {

                    picCheckCount++;

                    console.log( 'empty pic' + i, ' count:' + picCheckCount );
                    if( picCheckCount === 3 ){

                        addItem();
                    }
                }

            }

            // 添加新商品
            function addItem(){

                console.log( 'addItem' );
                var auth = new Auth();
                var userInfo = auth.getAuthInfo( req );
                var userId = userInfo.id;
                var count = 0;
                var i, pic;

                // 新建商品
                newItem.add( userId, {
                    title: title,
                    desc: desc,
                    price: price,
                    location: latlng.split( ',' ),
                    address: address
                }, function ( newItem ){

                       console.log( 'item add done' );
                    var itemId = newItem.id;

                    console.log( 'begin add pics', 'pic length:' + pics );
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

                console.log( 'itemAdd success!' );
                API.send( req, res, {
                    result: true,
                    type: 'newItem',
                    data: {
                        itemId: itemId
                    }
                });
            }
        }
    },

    /**
     * 文件上传
     */
    imageUpload: {
        type: 'post',
        rule: '/imageupload',
        // middleware: [ 'shouldLogin' ]
        fn: function( req, res ){
            
            var image = req.files.image;

//            image.length;
//            image.filename;
//            image.mime;
//            image.path;

            FS.rename( image.path, 'uploads/' + image.filename + '.jpg', function( err ){

                if( err ){
                    console.log( '重命名出错' );
                    console.log( err );
                }
                else {
                    console.log( '重命名成功' );
                }
            });
        }
    }
};

module.exports = Router;