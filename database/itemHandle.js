/**
 * 二手商品的数据库操作
 */
require( './item' );

var _ = require( 'underscore' );
var Util = require('util');
var mongoose = require( 'mongoose' );
var UserHandle = require( './userHandle' );
var ImgHandle = require( './imageHandle' );
var CatHandle = require( './categoryHandle' );
var Item = mongoose.model( 'item');
var EventEmitter = require('events').EventEmitter;

var itemHandle = function(){

    EventEmitter.call( this );
};

Util.inherits( itemHandle, EventEmitter );

_.extend( itemHandle.prototype, {

    /**
     * 添加新商品
     * @param userId
     * @param itemObj
     * @param next
     */
    add: function( userId, itemObj, next ){

        var that = this;
        var User = new UserHandle();
        var catHandle = new CatHandle();

        // 检查userId是否存在
        User.getById( userId, function( user ){

            var newItem;
            itemObj.userId = userId;

            //todo 添加postdate

            newItem = new Item( itemObj );
            newItem.save( function( err ){

                if( err ){

                    that.emit( '_error', '添加商品失败', err );
                }
                else {

                    var category = newItem.category;

                    // 若给定了category，则更新category先关信息
                    if( category ){

                        catHandle.add( category, true, function ( cat ){

                            next( newItem );
                        });
                    }
                    else {
                        next( newItem );
                    }
                }
            });
        });

        catHandle.on( '_error', function ( msg, err){

            that.emit( '_error', msg, err );
        });

        // 若id不存在
        User.on( '_error', function( msg, err ){

            that.emit( '_error', msg, err );
        });

    },

    /**
     * 根据条件检索商品
     * // todo 对title/desc/address 使用or，category使用 数据 in
     * @param query {Object} {
     *      title: {String},
     *      desc: {String},
     *      price: {Number},
     *      priceType: {String} '>' '>=' '<' '<=' '='
     *      location: [ latitude, longitude ],
     *      maxDistance: Number,
     *      address: {String},
     *      ids: [String],
     *      id: {String},
     *      userId: {String},
     *      category: [String]
     * }
     * @param fields
     * @param next
     * @example item.query( { title: 'hello', category: '自行车', price: 20, priceType: '>=', location: [ 12, 32 ], ids: [ '34214', '3411', '4141'], id: 'kjdlakjf' }
     */
    query: function( query, fields, next ){

        var that = this;
        var imgH = new ImgHandle();
        var userH = new UserHandle();
        var queryObj = {};
        var queryField = undefined;
        var queryValue = undefined;
        var imgFindCount = 0;
        var userFindCount = 0;

        imgH.on( '_error', function ( msg, err ){

            that.emit( '_error', msg, err );
        });

        userH.on( '_error', function ( msg, err ){

            that.emit( '_error', msg, err );
        });

        for( queryField in query ){

            queryValue = query[ queryField ];

            switch( queryField ){

                case 'title':
                case 'desc':
                case 'address': {
                    queryObj[ queryField ] = {
                        $regex: new RegExp( queryValue )
                    };

                    break;
                }
                case 'location': {

                    var maxDistance = query.maxDistance;

                    if( maxDistance ){

                        // 地球半径km
                        var earthRadius = 6378;

                        queryObj.location = {
                            $nearSphere: queryValue,
                            // 计算最远距离对应的地球弧度，因此需要除以地球半径
                            // 若不给定，则默认为1km
                            $maxDistance: maxDistance ? ( maxDistance / earthRadius ) : ( 1 / earthRadius )
                        };
                    }
                    else {

                        queryObj.location = queryValue;
                    }

                    break;
                }
                case 'price': {

                    var priceType = query.priceType || '=';

                    if( priceType === '=' ){

                        queryObj.price = queryValue;
                    }
                    else {

                        switch( priceType ){
                            case '>': {
                                priceType = '$gt';
                                break;
                            }
                            case '>=': {
                                priceType = '$gte';
                                break;
                            }
                            case '<': {
                                priceType = '$lt';
                                break;
                            }
                            case '<=':
                                priceType = '$lte';
                                break;
                            default:
                                break;
                        }

                        queryObj.price = {};
                        queryObj.price[ priceType ] = queryValue;
                    }

                    break;
                }
                case 'ids':
                case 'category': {

                    queryObj[ queryField ] = {
                        $in: queryValue
                    };

                    break;
                }
                case 'id': {
                    queryObj._id = queryValue;
                    break;
                }
                case 'userId': {
                    queryObj.userId = queryValue;
                    break;
                }
            }
        }

        if( typeof fields === 'function' ){

            next = fields;
            fields = [];
        }

        Item.find( queryObj, fields, function( err, items ){

            console.log( queryObj, query );
            if( err ){

                console.log( err );
                that.emit( '_error', '查找商品失败!', err );
            }
            else {

                // 查找每个items的图片
                if( items.length > 0 ){
                    items.forEach(function ( item ){

                        // 获取图片信息
                        imgH.getByItemId( item._id, function ( imgs ){

                            item.imgs = imgs;
                            imgFindCount++;

                            if( imgFindCount === items.length && userFindCount === items.length ){

                                next( items );
                            }
                        });

                        // 获取用户信息
                        userH.getById( item.userId, function ( user ){

                            item.user = user;
                            userFindCount++;

                            if( imgFindCount === items.length && userFindCount === items.length ){

                                next( items );
                            }
                        });
                    });
                }
                else {

                    next( items );
                }
            }
        });
    },

    /**
     * 更具商品id查找商品
     * @param id
     * @param next( items ) --> 该item对象拥有成员item.imgs
     */
    getById: function( id, next ){

        var that = this;
        var imgH = new ImgHandle();
        var userH = new UserHandle();
        var ifUserInfoFinished = false;
        var ifImgFinished = false;
        var ifErrorOccur = false;

        imgH.on( '_error', function ( msg, err ){

            ifErrorOccur = true;
            that.emit( '_error', msg, err );
        });

        userH.on( '_error', function ( msg, err ){

            ifErrorOccur = true;
            that.emit( '_error', msg, err );
        });

        Item.findById( id, function( err, item ){

            if( err ){
                return that.emit( '_error', '查找出错，id:' + id, err );
            }
            else {

                if( item ){

                    // 获取该item对应的图片
                    imgH.getByItemId( item._id, function ( imgs ){

                        item.imgs = imgs;

                        ifImgFinished = true;

                        if( ifImgFinished && ifUserInfoFinished && ifErrorOccur === false ){
                            return next( item );
                        }
                    });

                    userH.getById( item.userId, function ( user ){

                        item.user = user;

                        ifUserInfoFinished = true;

                        if( ifImgFinished && ifUserInfoFinished && ifErrorOccur === false ){
                            return next( item );
                        }
                    });
                }
                else {

                    that.emit( '_error', 'id为:' + id + ' 的商品不存在!', err );
                }
            }
        });


    },

    /**
     * 删除指定id的商品
     * @param itemId
     * @param next
     */
    del: function( itemId, next ){

        var that = this;
        var catHandle = new CatHandle();

        catHandle.on( '_error', function ( msg, err ){

            that.emit( '_error', msg, err );
        });

        // 检查itemId是否存在
        this.getById( itemId, function( item ){

            var category = item.category;

            item.remove( function( err ){

                if( err ){

                    that.emit( '_error', '删除商品失败！', err );
                }
                else {

                    // 更新该分类的信息
                    catHandle.updateItemCount( { name: category }, '-1', function (){

                        next( item );
                    });
                }
            });
        });
    },

    /**
     * 根据商品id修改商品信息
     * @param itemId
     * @param updateObj
     * @param next
     */
    update: function( itemId, updateObj, next ){

        var that = this;
        var catHandle = new CatHandle();

        catHandle.on( '_error', function ( msg, err ){

            that.emit( '_error', msg, err );
        });

        // 检查itemId是否存在
        this.getById( itemId, function( item ){

            var oldCat = item.category;
            var newCat = updateObj.category;

            item.title = updateObj.title || item.title;
            item.price = updateObj.price || item.price;
            item.desc = updateObj.desc || item.desc;
            item.location = updateObj.location || item.location;
            item.address = updateObj.address || item.address;
            item.category = updateObj.category || item.category;

            item.save( function( err ){

                if( err ){

                    that.emit( '_error', '商品保存修改失败', err );
                }
                else {

                    // 下面若商品类别有变更，则对新类别做添加，旧类别做删除操作
                    var ifNewCatFinished = false;
                    var ifOldCatFinished = false;

                    if( newCat ){

                        catHandle.add( newCat, true, function (){

                            ifNewCatFinished = true;

                            if( ifNewCatFinished && ifOldCatFinished ){

                                next( item );
                            }
                        });
                    }
                    else {
                        ifNewCatFinished = true;
                    }

                    if( oldCat ){

                        catHandle.del( { name: oldCat }, function (){

                            ifOldCatFinished = true;

                            if( ifNewCatFinished && ifOldCatFinished ){

                                next( item );
                            }
                        });
                    }
                    else {
                        ifOldCatFinished = true;
                    }

                    if( ifNewCatFinished && ifOldCatFinished ){

                        next( item );
                    }
                }
            });
        });
    }
});


module.exports = itemHandle;