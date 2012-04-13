/**
 * 图片类型和大小验证
 */

var Upload = require( '../../image_handle/' );

// 设置最大图片尺寸为1M
var M = 1024 * 1024;
var MAX_SIZE = 1 * M;

// 格式和大小都符合的图片
var SIZE_FORMAT_PATH = __dirname + '/images/size_format.bmp';
// 格式不符合大小符合
var SIZE_NO_FORMAT_PATH = __dirname + '/images/size_no_format.pdf';
// 格式符合大小不符合
var NO_SIZE_FORMAT_PATH = __dirname + '/images/no_size_format.jpg';
// 格式和大小都不符合
var NO_SIZE_NO_FORMAT_PATH = __dirname + '/images/no_size_no_format.pdf';

Upload.setMaxSize( MAX_SIZE );

describe( '图片类型和大小验证', function(){

    it( '格式和大小都符合的图片', function(){

        var v;
        var t;
        var e;
        var tmpPath;

        runs(function(){
            Upload.check( SIZE_FORMAT_PATH, function( err, valid, imgInfo ){
                e = err;
                v = valid;
                t = valid ? imgInfo.type : imgInfo;
            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( true );
            expect( t ).toEqual( 'bmp' );
        });

        // base64Check
        runs(function (){

            e = undefined;
            v = undefined;
            t = undefined;

            // 先转化为base64字符串
            Upload.base64Encode( SIZE_FORMAT_PATH, function ( err, ds ){

                Upload.base64Check( ds, function ( err, path, valid, imgInfo ){

                    e = err;
                    v = valid;
                    t = valid ? imgInfo.type : imgInfo;
                    tmpPath = path;
                });

            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( true );
            expect( t ).toEqual( 'bmp' );
            expect( tmpPath.indexOf( '/tmp/' )).toBe( 0 );
        });
    });

    it( '格式不符合大小符合', function(){

        var v;
        var t;
        var e;
        var tmpPath;

        runs(function(){
            Upload.check( SIZE_NO_FORMAT_PATH, function( err, valid, imgInfo ){

                e = err;
                v = valid;
                t = valid ? imgInfo.type : imgInfo;
                console.log( 'SIZE_NO_FORMAT_PATH', imgInfo, valid, t ) ;

            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片格式' );
        });

        // base64Check
        runs(function (){

            e = undefined;
            v = undefined;
            t = undefined;

            // 先转化为base64字符串
            Upload.base64Encode( SIZE_NO_FORMAT_PATH, function ( err, ds ){

                Upload.base64Check( ds, function ( err, path, valid, imgInfo ){

                    e = err;
                    v = valid;
                    t = valid ? imgInfo.type : imgInfo;
                    tmpPath = path;
                });

            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片格式' );
            expect( tmpPath.indexOf( '/tmp/' )).toBe( 0 );
        });
    });

    it( '格式符合大小不符合', function(){

        var v;
        var t;
        var e;
        var tmpPath;

        runs(function(){
            Upload.check( NO_SIZE_FORMAT_PATH, function( err, valid, imgInfo ){

                console.log( arguments );
                e = err;
                v = valid;
                t = valid ? imgInfo.type : imgInfo;
            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片文件大小' );
        });

        // base64Check
        runs(function (){

            e = undefined;
            v = undefined;
            t = undefined;

            // 先转化为base64字符串
            Upload.base64Encode( NO_SIZE_FORMAT_PATH, function ( err, ds ){

                Upload.base64Check( ds, function ( err, path, valid, imgInfo ){

                    e = err;
                    v = valid;
                    t = valid ? imgInfo.type : imgInfo;
                    tmpPath = path;
                });

            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片文件大小' );
            expect( tmpPath.indexOf( '/tmp/' )).toBe( 0 );
        });
    });

    it( '格式和大小都不符合', function(){

        var v;
        var t;
        var e;
        var tmpPath;

        runs(function(){
            Upload.check( NO_SIZE_NO_FORMAT_PATH, function( err, valid, imgInfo ){
                e = err;
                v = valid;
                t = valid ? imgInfo.type : imgInfo;
            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片格式' );
        });

        // base64Check
        runs(function (){

            e = undefined;
            v = undefined;
            t = undefined;

            // 先转化为base64字符串
            Upload.base64Encode( NO_SIZE_NO_FORMAT_PATH, function ( err, ds ){

                Upload.base64Check( ds, function ( err, path, valid, imgInfo ){

                    e = err;
                    v = valid;
                    t = valid ? imgInfo.type : imgInfo;
                    tmpPath = path;
                });

            });
        });

        waitsFor( function(){

            return v === false || v === true;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( v ).toEqual( false );
            expect( t ).toEqual( '非法的图片格式' );
            expect( tmpPath.indexOf( '/tmp/' )).toBe( 0 );
        });
    });
});
