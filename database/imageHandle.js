/**
 * 二手商品图片的数据库操作
 */
require( './image' );

var _ = require( 'underscore' );
var Util = require('util');
var mongoose = require( 'mongoose' );
var ImageModel = mongoose.model( 'image' );
var EventEmitter = require('events').EventEmitter;

var imageHandle = function(){

    EventEmitter.call( this );
};

Util.inherits( imageHandle, EventEmitter );

_.extend( imageHandle.prototype, {

    /**
     * 添加图片
     * @param itemId
     * @param imgObj
     * @param next
     */
    add: function( itemId, imgObj, next ){

        var ItemHandle = require( './itemHandle' );
        var itemHandle = new ItemHandle;

        var that = this;

        // 检查itemId是否存在
        itemHandle.on( '_error', function( msg, err ){

            that.emit( '_error', msg, err );
        });
        
        itemHandle.getById( itemId, function( item ){

            var newImg;
            var newImgModel = {
                itemId: itemId,
                path: imgObj.path, // 文件储存路径
                mime: imgObj.mime,
                type: imgObj.type, // 后缀名
                size: imgObj.size  // 字节数
            };

            newImg = new ImageModel( newImgModel );
            newImg.save( function( err ){

                if( err ){

                    that.emit( '_error', '添加图片失败', err );
                }
                else {

                    next( newImg );
                }
            });
        });
    },

    /**
     * 根据id删除图片
     * @param imgId
     * @param next
     */
    del: function( imgId, next ){

        var that = this;

        this.getById( imgId, function( img ){

            img.remove( function( err ){

                if( err ){

                    that.emit( '_error', '删除图片失败！', err );
                }
                else {

                    next( img );
                }
            });
        });
    },

    /**
     * 删除所有指定itemId的图片
     * @param {String} itemId
     * @param {Function} next( imgs ) imgs为被删除的图像数组
     */
    delByItemId: function ( itemId, next ){

        var that = this;
        var ifError = false;
        var imgCount = 0;
        var imgLen = 0;

        ImageModel.find({ itemId: itemId }, function ( err, imgs ){

            if( err ){

                ifError = true;
                that.emit( '_error', '查找itemId为：' + itemId + ' 的图片失败!', err );
            }
            else {

                imgLen = imgs ? imgs.length : 0;

                imgs && imgs.forEach(function ( img ){

                    img.remove(function ( err ){

                        imgCount++;

                        if( ifError === false ){

                            if( err ){

                                ifError = true;
                                that.emit( '_error', '删除图片出错！', err );
                            }
                            else {

                                if( imgCount === imgLen ){

                                    next( imgs );
                                }
                            }
                        }

                    });
                });

                if( imgCount === imgLen ){

                    next( [] );
                }
            }
        });
    },

    /**
     * 更新图片信心
     * @param imgId
     * @param updateObj
     * @param next
     */
    update: function( imgId, updateObj, next ){

        var that = this;

        // 检查itemId是否存在
        this.getById( imgId, function( img ){

            img.path = updateObj.path || img.path;
            img.mime = updateObj.mime || img.mime;
            img.type = updateObj.type || img.type;
            img.size = updateObj.size || img.size;

            img.save( function( err ){

                if( err ){

                    that.emit( '_error', '图片保存修改失败', err );
                }
                else {

                    next( img );
                }
            });
        });
    },

    /**
     * 根据图片id获取图片
     * @param imgId
     * @param next
     */
    getById: function( imgId, next ){

        var that = this;

        ImageModel.findById( imgId, function( err, img ){

            if( err ){
                
                return that.emit( '_error', '查找出错，id:' + imgId, err );
            }
            else {

                if( img ){

                    return next( img );
                }
                else {

                    that.emit( '_error', 'id为:' + imgId + ' 的图片不存在!', err );
                }
            }
        });
    },

    /**
     * 根据itemId 获取图片
     * @param itemId
     * @param next
     */
    getByItemId: function ( itemId, next ){

        var that = this;

        ImageModel.find( { itemId: itemId }, function( err, imgs ){

            if( err ){

                return that.emit( '_error', '查找出错，itemId:' + itemId, err );
            }
            else {

                if( imgs ){

                    return next( imgs );
                }
                else {

                    that.emit( '_error', 'itemId为:' + itemId + ' 的图片不存在!', err );
                }
            }
        });
    }
});

module.exports = imageHandle;