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
     * todo 删除调试用的console
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
            var auth = new Auth();
            var userInfo = auth.getAuthInfo( req );

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
     * @param title 商品标题中需要包含的关键词
     * @param desc 商品表述中需要包含的关键词
     * @param address 商品地址中需要包含的关键词
     * @param location 用户的坐标 用逗号隔开
     * @param maxDistance 根据用户坐标的搜索范围 若该值不给定，则直接寻找与location相等的项目
     * @param price 用户价格的值，与priceType一起使用
     * @param priceType 价格比较类型 todo 添加多条件，用逗号隔开
     * @param ids 直接制定需要获取的所有id对应的item,用逗号隔开
     * @param id 直接制定itemid，该字段给定后将直接忽略另外两个字段
     * @param len 最多获取的item数量
     * @param fields 需要获取的字段 用逗号隔开
     * @return { items: [ 有len指定的item ], ids: [ 所有的结果item的_id值]
     */
    searchItem: {

        type: 'get',
        rule: '/searchitem',
//        middleware: [ 'shouldLogin' ],

        fn: function ( req, res ){

            // 商品搜索query 直接使用js表达式，比如 'this.price > 200'
            var query = req.query;
            var queryObj = {};
            var queryField = undefined;
            var queryValue = undefined;
            var fields = query.fields ? query.fields.split( ',' ) : [];

            // 最多获取的items数量
            var maxLen = isNaN( parseInt( req.query.len ) ) ? 10 : parseInt( req.query.len );
            var itemHandle = new DB.item();
            var itemCount = 0;
            var _items = [];
            var _ids = [];

            itemHandle.on( '_error', function ( msg, error ){

                API.send( req, res, {
                    result: false,
                    type: 'searchItem',
                    error: msg,
                    data: error
                });
            });

            for( queryField in query ){

                queryValue = query[ queryField ];

                switch( queryField ){
                    case 'location':
                    case 'ids': {
                        queryObj[ queryField ] = queryValue.split( ',' );
                        break;
                    }
                    case 'title':
                    case 'desc':
                    case 'address':
                    case 'price':
                    case 'priceType':
                    case 'id':
                    case 'maxDistance': {
                        queryObj[ queryField ] = queryValue;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            itemHandle.query( queryObj, fields, function ( items ){

                // items被json化后无法找到imgs成员
                // 先把每个item的数据部分转化出来
                items.forEach(function ( item ){

                    var _item = item.toJSON();

                    if( itemCount < maxLen ){

                        _item.imgs = item.imgs;

                        _items.push( _item );

                        itemCount++;
                    }

                    _ids.push( _item._id );
                });

                API.send( req, res, {
                    result: true,
                    type: 'searchItem',
                    error: undefined,
                    data: {
                        items: _items,
                        ids: _ids
                    }
                });
            });
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