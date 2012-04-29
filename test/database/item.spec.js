/**
 * db.item下的api，单元测试
 */

var DB = require( '../../database/' );
var mongoose = require( 'mongoose' );
var ITEM = mongoose.model( 'item' );
var waitsForTimeout = 5000;

describe( '商品操作接口', function(){

    var newUser;
    var newUserId;
    var newItem;
    var newItemId;
    var originItemObj;

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

    it( '添加商品', function(){

        var Item = new DB.item();
        var itemObj = originItemObj = newItemObj( 'add' );
        var itemAddFinished = false;
        var itemAddErr;
        var itemAddErrMsg;
        var getItemFinished = false;

        // 添加新商品
        runs( function(){

            Item.add( newUserId, itemObj, function( i ){

                itemAddFinished = true;
                newItemId = i._id;
            });

            Item.on( '_error', function( msg, err ){

                itemAddFinished = true;
                itemAddErr = err;
                itemAddErrMsg = msg;
            });
        })
        
        waitsFor( function(){

            return itemAddFinished;
        }, '添加商品 超时', waitsForTimeout );

        // 应该不会出现错误
        runs( function(){

            expect( typeof itemAddErr ).toEqual( 'undefined' );
            expect( typeof itemAddErrMsg ).toEqual( 'undefined' );
            expect( typeof newItemId ).not.toEqual( 'undefined' );
        });

        // 根据id获取刚刚添加的商品
        runs( function(){

            ITEM.findById( newItemId, function( err, item ){

                getItemFinished = true;
                newItem = item;
            });
        });

        waitsFor( function(){
            return getItemFinished;
        }, '添加商品, 重新根据id获取 超时', waitsForTimeout);

        // 验证添加的商品是否正确
        runs( function(){

            expect( typeof newItem ).not.toEqual( 'undefined' );
            expect( newItem.title ).toEqual( itemObj.title );
            expect( newItem.price ).toEqual( itemObj.price );
            expect( newItem.desc ).toEqual( itemObj.desc );
            expect( newItem.location[ 0 ] ).toEqual( itemObj.location[ 0 ] );
            expect( newItem.location[ 1 ] ).toEqual( itemObj.location[ 1 ] );

        });
    });

    it( 'getById', function(){

        var Item = new DB.item();
        var getFinished = false;
        var getErr;
        var getErrMsg;
        var item;

        runs( function(){

            Item.getById( newItemId, function( i ){

                getFinished = true;
                item = i;
            });

            Item.on( '_error', function( msg, err ){

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
            expect( typeof item ).not.toEqual( 'undefined' );
            expect( item.title ).toEqual( originItemObj.title );
            expect( item.price ).toEqual( originItemObj.price );
            expect( item.desc ).toEqual( originItemObj.desc );
            expect( item.location[ 0 ] ).toEqual( originItemObj.location[ 0 ] );
            expect( item.location[ 1 ] ).toEqual( originItemObj.location[ 1 ] );
        });

        // 给定错误格式的id
        runs( function(){

            item = undefined;
            getFinished = false;
            getErr = undefined;
            getErrMsg = undefined;

            // 此处由于id格式错误，因此其实是同步的情况，如果on在后面，会出现没有捕获异常的情况
            Item.on( '_error', function( msg, err ){

                getFinished = true;
                getErr = err;
                getErrMsg = msg;
            });

            Item.getById( newItemId + Date.now(), function( i ){

                getFinished = true;
                item = i;
            });
        });

        waitsFor( function(){

            return getFinished;
        }, 'getById错误id 超时', waitsForTimeout);

        runs( function(){

            expect( typeof getErr ).not.toEqual( 'undefined' );
            expect( typeof getErrMsg ).not.toEqual( 'undefined' );
            expect( typeof item ).toEqual( 'undefined' );
        });
    });

    it( 'query', function(){

        var itemAddCount = 0;
        var imgAddCount = 0;
        var itemAddErr = undefined;
        var itemAddErrMsg = undefined;
        var imgAddErr = undefined;
        var imgAddErrMsg = undefined;
        var itemQueryErr = undefined;
        var itemQueryErrMsg = undefined;
        var itemQueryResult = undefined;
        var addFinished = false;
        var currentDate = Date.now();

        var newItemObjs = [
            newItemObj( 'query_one' ),
            newItemObj( 'query_two' ),
            newItemObj( 'query_three' )
        ];
        var newItems = [];
        var newImgObjs = [

            newImgObj( 'query_one' ),
            newImgObj( 'query_two' ),
            newImgObj( 'query_three' )
        ];
        var newImgs = [];
        var itemToImg = {};

        runs(function (){

            var Item = new DB.item();
            var Img = new DB.image();

            newItemObjs.forEach( function ( itemObj ){

                Item.add( newUserId, itemObj, function( i ){

//                itemAddFinished = true;
//                newItemId = i._id;
                    itemAddCount++;
                    newItems.push( i );
                    newItems[ i._id ] = i;

                    if( itemAddCount === 3 ){

                        newImgObjs.forEach(function ( imgObj, index ){

                            Img.add( newItems[ index ]._id, imgObj, function ( img ){

                                imgAddCount++;
                                newImgs.push( img );
                                newImgs[ img._id ] = img;
                                if( !itemToImg[ img.itemId ] ){

                                    itemToImg[ img.itemId ] = [];
                                }

                                itemToImg[ img.itemId ].push( img );

                                if( imgAddCount === 3 ){

                                    addFinished = true;
                                }
                            });
                        });
                    }
                });
            });


            Item.on( '_error', function( msg, err ){

                itemAddErr = err;
                itemAddErrMsg = msg;
            });

            Img.on( '_error', function ( msg, err ){

                imgAddErr = err;
                imgAddErrMsg = msg;
            });
        });

        waitsFor(function (){

            return addFinished;
        });

        runs(function (){

            var Item = new DB.item();
            Item.on( '_error', function ( msg, err ){

                itemQueryErr = err;
                itemQueryErrMsg = msg;
            });

            Item.query( { price: currentDate, priceType: '>=' }, function ( items ){

                itemQueryResult = items;
            });
        });

        waitsFor(function (){

            return itemQueryResult;
        }, 5000 );

        runs(function(){

            var items = itemQueryResult;

            expect( items.length ).toBe( 3 );

            items.forEach(function ( item ){

                var originItem = newItems[ item._id ];
                var itemJSON = item.toJSON();

                expect( itemAddErr).toBeUndefined();
                expect( itemAddErrMsg ).toBeUndefined();
                expect( imgAddErr ).toBeUndefined();
                expect( imgAddErrMsg ).toBeUndefined();
                expect( itemQueryErr ).toBeUndefined();
                expect( itemQueryErrMsg ).toBeUndefined();

                // 比较item是否一致
                expect( itemJSON.title ).toEqual( originItem.title );
                expect( itemJSON.desc ).toEqual( originItem.desc );
                expect( itemJSON.price ).toEqual( originItem.price );
                expect( item.imgs.length ).toEqual( itemToImg[ item._id ].length );
            });
        });
    });

    it( 'update商品', function(){

        var Item = new DB.item();
        var updateItem = newItemObj( 'update' );
        var updateFinished = false;
        var getItemFinished = false;
        var item;

        // 验证修改后的和旧的不一样
        runs( function(){
            
            expect( updateItem.title ).not.toEqual( originItemObj.title );
            expect( updateItem.price ).not.toEqual( originItemObj.price );
            expect( updateItem.desc ).not.toEqual( originItemObj.desc );
            expect( updateItem.location[ 0 ] ).not.toEqual( originItemObj.location[ 0 ] );
            expect( updateItem.location[ 1 ] ).not.toEqual( originItemObj.location[ 1 ] );
        });

        runs( function(){

            Item.update( newItemId, updateItem, function( ui ){

                updateFinished = true;
            });
        });

        waitsFor( function(){
            return updateFinished;
        }, 'update商品超时', waitsForTimeout );

        // 从新从数据库中获取
        runs(function(){

            Item.getById( newItemId, function( i ){

                getItemFinished = true;
                item = i;
            });
        });

        waitsFor( function(){

            return getItemFinished;
        }, '重新获取商品数据超时', waitsForTimeout );

        runs( function(){
            
            expect( typeof item ).not.toEqual( 'undefined' );
            expect( item.title ).toEqual( updateItem.title );
            expect( item.price ).toEqual( updateItem.price );
            expect( item.desc ).toEqual( updateItem.desc );
            expect( item.location[ 0 ] ).toEqual( updateItem.location[ 0 ] );
            expect( item.location[ 1 ] ).toEqual( updateItem.location[ 1 ] );
        });
    });

    it( '删除商品', function(){

        var Item = new DB.item();
        var delFinished = false;
        var getFinished = false;
        var getErr;
        var getErrMsg;

        runs( function(){

            Item.del( newItemId, function(){

                delFinished = true;
            });
        });

        waitsFor( function(){

            return delFinished;
        }, '删除商品超时', waitsForTimeout );

        // 重新查找该商品，验证已经删除
        runs( function(){

            Item.on( '_error', function( msg, err ){

                getErr = err;
                getErrMsg = msg;
                getFinished = true;
            });

            Item.getById( newItemId, function( i ){

                getFinished = true;
            });
        });

        waitsFor( function(){
            return getFinished;
        }, '获取商品超时', waitsForTimeout );

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
function newItemObj( apiType ){

    var itemObj = {
        title: 'jasmine_item_api_' + apiType + Date.now() + '_title',
        price: Date.now(),
        desc: 'jasmine_item_api_' + apiType + Date.now() + '_desc',
        location: [ Date.now() + 1, Date.now() + 10 ]
    };

    return itemObj;
}

function newImgObj( apiType ){

    var imgObj = {
        path: 'jasmine_img_api_' + apiType + Date.now() + '_path',
        mime: 'image/' + Date.now(),
        type: 'jasmine_img_api_' + apiType + Date.now() + '_type',
        size: Date.now()
    };

    return imgObj;
}
