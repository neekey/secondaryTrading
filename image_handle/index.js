/**
 * 处理与图片上传相关的逻辑
 */

var MIME = require( 'gettype' );
var FS = require( 'fs' );
var Base64 = require( 'base64js' );
var UTIL = require( 'util' );
var _ = require( 'underscore' );
var M = 1024 * 1024;
var MAX_SIZE = 1 * M;
var ValidType = [ 'jpeg', 'jpg', 'png', 'gif', 'bmp' ];

var upload = {

    /**
     * 设置最大允许的图片大小
     * @param maxSize
     */
    setMaxSize: function( maxSize ){

        MAX_SIZE = maxSize;
    },

    /**
     * 将base64字符串转化为二进制文件
     * @param base64String
     * @param path
     * @param next
     */
    base64Decode: function ( base64String, path, next ){

        Base64.decode( base64String, path, next );
    },

    base64Encode: function ( path, next ){

        Base64.encode( path, next );
    },

    /**
     * 返回一个随即的tmp路径
     * @return {String}
     */
    tmpPath: function (){
        var x = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
        var y = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
        var z = Math.floor(Math.random() * Math.pow(16,4)).toString(16);

        return '/tmp/' + [x,y,z].join('_');
    },

    /**
     * 将指定的base64字符串临时保存
     * @param base64String
     * @param next( err, tmpPath )
     */
    base64TmpSave: function ( base64String, next ){

        var tmpPath = this.tmpPath();

        this.base64Decode( base64String, tmpPath, function ( err ){

            if( err ){
                next( err );
            }
            else {
                next( undefined, tmpPath );
            }
        });

    },

    /**
     * 检查图片格式是否合法
     * @param path
     * @param next( err, ifValid, type, mimeType )
     */
    typeCheck: function( path, next ){

        MIME.parse( path, function( err, type, mimeType ){

            var typeIndex;

            if( err ){

                next( err );
            }
            else {

                if( _.indexOf( ValidType, type ) >= 0 ){

                    next( undefined, true, type, mimeType );
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
     * @param next( err, ifValid, size )
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

                    next( undefined, true, stats.size );
                }
            }
        });
    },

    /**
     * 检查base64字符串的类型和大小是否正常
     * @param base64String
     * @param next( err, path, ifValid, imgInfo )
     */
    base64Check: function ( base64String, next ){

        var that = this;

        this.base64TmpSave( base64String, function ( err, path ){

            if( err ){

                next( err );
            }
            else {

                that.check( path, function ( err, result, imgInfo ){

                    next( err, path, result, imgInfo );
                });
            }
        });
    },

    /**
     * 检查上传的图片是否合法（大小和图片类型）
     * @param path
     * @param next ( err, ifValid, imgInfo )
     */
    check: function( path, next ){

        var that = this;

        // 先检查文件类型
        this.typeCheck( path, function( err, valid, type, mimeType ){

            if( err ){

                next( err );
            }
            else {

                if( valid ){

                    // 检查文件大小
                    that.sizeCheck( path, function( err, result, size ){

                        if( err ){

                            next( err );
                        }
                        else {

                            if( result ){

                                console.log( {
                                    path: path,
                                    type: type,
                                    size: size,
                                    mimeType: mimeType
                                });

                                next( undefined, true, {
                                    path: path,
                                    type: type,
                                    size: size,
                                    mimeType: mimeType
                                });
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
    },

    /**
     * 将图片进行另存为
     * @param oldPath
     * @param newPath
     * @param next
     */
    saveAs: function ( oldPath, newPath, next ){

        FS.rename( oldPath, newPath, function( err ){

            if( err ){
                next( err );
            }
            else {
                next();
            }
        });
    }
};

module.exports = upload;