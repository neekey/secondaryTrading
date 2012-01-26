/**
 * 处理与图片上传相关的逻辑
 */

var MIME = require( '../mime' );
var FS = require( 'fs' );
var UTIL = require( 'util' );
var _ = require( 'underscore' );
var M = 1024 * 1024;
var MAX_SIZE = 1 * M;
var ValidType = [ 'jpeg', 'png', 'gif', 'bmp' ];

var upload = {

    /**
     * 设置最大允许的图片大小
     * @param maxSize
     */
    setMaxSize: function( maxSize ){

        MAX_SIZE = maxSize;
    },

    /**
     * 检查图片格式是否合法
     * @param path
     * @param next
     */
    typeCheck: function( path, next ){

        MIME.parse( path, function( err, type ){

            var typeIndex;

            if( err ){

                next( err );
            }
            else {

                if( _.indexOf( ValidType, type ) >= 0 ){

                    next( undefined, true, type );
                }
                else {

                    next( undefined, false );
                }
            }
        });
    },

    /**
     * 检查文件大小是否合法
     * @param path
     * @param next
     */
    sizeCheck: function( path, next ){

        this.getStat( path, function( err, stats ){

            if( err ){

                next( err );
            }
            else {

                if( stats.size > MAX_SIZE ){

                    next( undefined, false );
                }
                else {

                    next( undefined, true );
                }
            }
        });
    },

    /**
     * 检查上传的图片是否合法（大小和图片类型）
     * @param path
     * @param next ( err, ifValid, imgType )
     */
    check: function( path, next ){

        var that = this;

        // 先检查文件类型
        this.typeCheck( path, function( err, valid, type ){

            if( err ){

                next( err );
            }
            else {

                if( valid ){

                    // 检查文件大小
                    that.sizeCheck( path, function( err, result ){

                        if( err ){

                            next( err );
                        }
                        else {

                            if( result ){

                                next( undefined, true, type );
                            }
                            else {

                                next( undefined, false, '非法的图片文件大小' );
                            }
                        }
                    });
                }
                else {

                    next( undefined, false, '非法的图片格式' );
                }
            }
        });
    },

    /**
     * 获取文件的属性
     * @param path
     * @param next
     */
    getStat: function( path, next ){

        FS.stat( path, function( err, stats ){

            if( err ){

                next( err );
            }
            else {

                next( null, stats );
            }
        });
    }
};

module.exports = upload;