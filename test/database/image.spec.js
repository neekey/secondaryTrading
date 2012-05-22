/**
 * db.image下的api，单元测试
 */

var DB = require( '../../database/' );
var mongoose = require( 'mongoose' );
var IMAGE = mongoose.model( 'image' );
var waitsForTimeout = 5000;

describe( '图片信息操作接口', function(){

    var newUser;
    var newUserId;
    var newItem;
    var newItemId;
    var newImg;
    var newImgId;
    var originImgObj;

    it( '添加用于测试的新用户', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var userAddFinished = false;

        // 添加新用户
        runs(function(){
            User.add( email, password, function( u ){
                userAddFinished = true;
                newUser = u;
                newUserId = u._id;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        // 作为商品操作的单元测试，并不对用户的添加做过多验证
        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });
    });

    it( '添加用于测试的新商品', function(){

        var Item = new DB.item();
        var itemObj = newItemObj( 'add' );
        var itemAddFinished = false;

        // 添加新商品
        runs( function(){

            Item.add( newUserId, itemObj, function( i ){

                itemAddFinished = true;
                newItem = i;
                newItemId = i._id;
            });
        });

        waitsFor( function(){

            return itemAddFinished;
        }, '添加商品 超时', waitsForTimeout );

        // 简单验证
        runs( function(){

            expect( typeof newItemId ).not.toEqual( 'undefined' );
        });
    });

    it( '添加图片', function(){

        var Img = new DB.image();
        var imgObj = originImgObj = newImgObj( 'add' );
        var imgAddFinished = false;
        var imgAddErr;
        var imgAddErrMsg;
        var getImgFinished = false;

        // 添加新商品
        runs( function(){

            Img.add( newItemId, imgObj, function( img ){

                imgAddFinished = true;
                newImgId = img._id;
            });

            Img.on( '_error', function( msg, err ){

                imgAddFinished = true;
                imgAddErr = err;
                imgAddErrMsg = msg;
            });
        });

        waitsFor( function(){

            return imgAddFinished;
        }, '添加图片 超时', waitsForTimeout );

        // 应该不会出现错误
        runs( function(){

            expect( typeof imgAddErr ).toEqual( 'undefined' );
            expect( typeof imgAddErrMsg ).toEqual( 'undefined' );
            expect( typeof newImgId ).not.toEqual( 'undefined' );
        });

        // 根据id获取刚刚添加的商品
        runs( function(){

            IMAGE.findById( newImgId, function( err, img ){

                getImgFinished = true;
                newImg = img;
            });
        });

        waitsFor( function(){
            return getImgFinished;
        }, '添加图片, 重新根据id获取 超时', waitsForTimeout);

        // 验证添加的商品是否正确
        runs( function(){

            expect( typeof newImg ).not.toEqual( 'undefined' );
            expect( newImg.path ).toEqual( imgObj.path );
            expect( newImg.mime ).toEqual( imgObj.mime );
            expect( newImg.type ).toEqual( imgObj.type );
            expect( newImg.size ).toEqual( imgObj.size );
        });
    });

    it( 'getById', function(){

        var Img = new DB.image();
        var getFinished = false;
        var getErr;
        var getErrMsg;
        var img;

        runs( function(){

            Img.getById( newImgId, function( i ){

                getFinished = true;
                img = i;
            });

            Img.on( '_error', function( msg, err ){

                getErr = err;
                getErrMsg = msg;
            });
        });

        waitsFor( function(){

            return getFinished;
        }, 'getById 超时', waitsForTimeout );

        runs( function(){

            expect( typeof getErr ).toEqual( 'undefined' );
            expect( typeof getErrMsg ).toEqual( 'undefined' );
            expect( typeof img ).not.toEqual( 'undefined' );
            expect( img.path ).toEqual( originImgObj.path );
            expect( img.mime ).toEqual( originImgObj.mime );
            expect( img.type ).toEqual( originImgObj.type );
            expect( img.size ).toEqual( originImgObj.size );
        });

        // 给定错误格式的id
        runs( function(){

            img = undefined;
            getFinished = false;
            getErr = undefined;
            getErrMsg = undefined;

            // 此处由于id格式错误，因此其实是同步的情况，如果on在后面，会出现没有捕获异常的情况
            Img.on( '_error', function( msg, err ){

                getFinished = true;
                getErr = err;
                getErrMsg = msg;
            });

            Img.getById( newImgId + Date.now(), function( i ){

                getFinished = true;
                img = i;
            });
        });

        waitsFor( function(){

            return getFinished;
        }, 'getById错误id 超时', waitsForTimeout);

        runs( function(){

            expect( typeof getErr ).not.toEqual( 'undefined' );
            expect( typeof getErrMsg ).not.toEqual( 'undefined' );
            expect( typeof img ).toEqual( 'undefined' );
        });
    });

    it( 'getByItemId', function(){

        var Img = new DB.image();
        var getFinished = false;
        var getErr;
        var getErrMsg;
        var imgs;
        var img;

        runs( function(){

            Img.getByItemId( newItemId, function( i ){

                getFinished = true;
                imgs = i;
            });

            Img.on( '_error', function( msg, err ){

                getErr = err;
                getErrMsg = msg;
            });
        });

        waitsFor( function(){

            return getFinished;
        }, 'getByItemId 超时', waitsForTimeout );

        runs( function(){

            img = imgs[ 0 ];
            expect( typeof getErr ).toEqual( 'undefined' );
            expect( typeof getErrMsg ).toEqual( 'undefined' );
            expect( typeof img ).not.toEqual( 'undefined' );
            expect( imgs.length).toBe( 1 );
            expect( img.path ).toEqual( originImgObj.path );
            expect( img.mime ).toEqual( originImgObj.mime );
            expect( img.type ).toEqual( originImgObj.type );
            expect( img.size ).toEqual( originImgObj.size );
        });

        // 给定错误格式的id
        runs( function(){

            img = undefined;
            getFinished = false;
            getErr = undefined;
            getErrMsg = undefined;

            // 此处由于id格式错误，因此其实是同步的情况，如果on在后面，会出现没有捕获异常的情况
            Img.on( '_error', function( msg, err ){

                getFinished = true;
                getErr = err;
                getErrMsg = msg;
            });

            Img.getByItemId( newItemId + Date.now(), function( i ){

                getFinished = true;
                img = i;
            });
        });

        waitsFor( function(){

            return getFinished;
        }, 'getById错误id 超时', waitsForTimeout);

        runs( function(){

            expect( typeof getErr ).not.toEqual( 'undefined' );
            expect( typeof getErrMsg ).not.toEqual( 'undefined' );
            expect( typeof img ).toEqual( 'undefined' );
        });
    });

    it( 'update图片', function(){

        var Img = new DB.image();
        var updateImg = newImgObj( 'update' );
        var updateFinished = false;
        var getImgFinished = false;
        var img;

        // 验证修改后的和旧的不一样
        runs( function(){

            expect( updateImg.path ).not.toEqual( originImgObj.path );
            expect( updateImg.mime ).not.toEqual( originImgObj.mime );
            expect( updateImg.type ).not.toEqual( originImgObj.type );
            expect( updateImg.size ).not.toEqual( originImgObj.size );
        });

        runs( function(){

            Img.update( newImgId, updateImg, function( ui ){

                updateFinished = true;
            });
        });

        waitsFor( function(){
            return updateFinished;
        }, 'update图片超时', waitsForTimeout );

        // 从新从数据库中获取
        runs(function(){

            Img.getById( newImgId, function( i ){

                getImgFinished = true;
                img = i;
            });
        });

        waitsFor( function(){

            return getImgFinished;
        }, '重新获取商品数据超时', waitsForTimeout );

        runs( function(){

            expect( typeof img ).not.toEqual( 'undefined' );
            expect( img.path ).toEqual( updateImg.path );
            expect( img.mime ).toEqual( updateImg.mime );
            expect( img.type ).toEqual( updateImg.type );
            expect( img.size ).toEqual( updateImg.size );
        });
    });

    it( '删除图片', function(){

        var Img = new DB.image();
        var delFinished = false;
        var getFinished = false;
        var getErr;
        var getErrMsg;

        runs( function(){

            Img.del( newImgId, function(){

                delFinished = true;
            });
        });

        waitsFor( function(){

            return delFinished;
        }, '删除图片超时', waitsForTimeout );

        // 重新查找该图片，验证已经删除
        runs( function(){

            Img.on( '_error', function( msg, err ){

                getErr = err;
                getErrMsg = msg;
                getFinished = true;
            });

            Img.getById( newImgId, function( i ){

                getFinished = true;
            });
        });

        waitsFor( function(){
            return getFinished;
        }, '获取图片超时', waitsForTimeout );

        runs( function(){

            expect( typeof getErr ).not.toEqual( 'undefined' );
            expect( typeof getErrMsg ).not.toEqual( 'undefined' );
        });
    });
});

/**
 * 返回唯一的用户生成新item的配置对象
 * @param apiType
 */
function newImgObj( apiType ){

    var imgObj = {
        path: 'jasmine_img_api_' + apiType + Date.now() + '_path',
        mime: 'image/' + Date.now(),
        type: 'jasmine_img_api_' + apiType + Date.now() + '_type',
        size: Date.now()
    };

    return imgObj;
}

function newItemObj( apiType ){

    var itemObj = {
        title: 'jasmine_item_api_' + apiType + Date.now() + '_title',
        price: 18739279 + parseInt( Math.random() * 100  + 1 ),
        desc: 'jasmine_item_api_' + apiType + Date.now() + '_desc',
        location: [ 120 + Math.random(), 30 + Math.random() ]
    };

    return itemObj;
}
