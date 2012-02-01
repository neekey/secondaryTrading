/**
 * 二手商品的数据库操作
 */
require( './item' );

var _ = require( 'underscore' );
var Util = require('util');
var mongoose = require( 'mongoose' );
var UserHandle = require( './userHandle' );
var Item = mongoose.model( 'item');
var EventEmitter = require('events').EventEmitter;

var itemHandle = function(){

    EventEmitter.call( this );
};

Util.inherits( itemHandle, EventEmitter );

_.extend( itemHandle.prototype, {

    add: function( userId, itemObj, next ){

        var that = this;
        var User = new UserHandle();

        // 检查userId是否存在
        User.getById( userId, function( user ){

            var newItem;
            var newItemModle = {
                userId: userId,
                title: itemObj.title,
                price: itemObj.price,
                desc: itemObj.desc,
                location: itemObj.location
            };

            newItem = new Item( newItemModle );
            newItem.save( function( err ){

                if( err ){

                    that.emit( '_error', '添加商品失败', err );
                }
                else {

                    next( newItem );
                }
            });
        });

        // 若id不存在
        User.on( '_error', function( msg, err ){

            that.emit( '_error', msg, err );
        });

    },

    /**
     * 根据条件检索商品
     * @param query
     * @param fields
     * @param next
     * //todo 添加单元测试
     */
    query: function( query, next ){

        var that = this;
        
        Item.find( query, fields, function( err, items ){

            if( err ){

                that.emit( '_error', '查找商品失败!', err );
            }
            else {

                next( items );
            }
        });
    },

    /**
     * 更具商品id查找商品
     * @param id
     * @param next
     */
    getById: function( id, next ){

        var that = this;

        Item.findById( id, function( err, item ){

            if( err ){
                return that.emit( '_error', '查找出错，id:' + id, err );
            }
            else {

                if( item ){

                    return next( item );
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

        // 检查itemId是否存在
        this.getById( itemId, function( item ){

            item.remove( function( err ){

                if( err ){

                    that.emit( '_error', '删除商品失败！', err );
                }
                else {

                    next( item );
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

        // 检查itemId是否存在
        this.getById( itemId, function( item ){

            item.title = updateObj.title || item.title;
            item.price = updateObj.price || item.price;
            item.desc = updateObj.desc || item.desc;
            item.location = updateObj.location || item.location;

            item.save( function( err ){

                if( err ){

                    that.emit( '_error', '商品保存修改失败', err );
                }
                else {

                    next( item );
                }
            });
        });
    }
});


module.exports = itemHandle;