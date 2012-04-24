
/**
 * Session Instance api单元测试
 */

var Mime = require( 'gettype' );
var JPEG_PATH = __dirname + '/images/jpeg.jpg';
var PNG_PATH = __dirname + '/images/png.png';
var GIF_PATH = __dirname + '/images/gif.gif';
var BMP_16_PATH = __dirname + '/images/bmp.16.bmp';
var BMP_32_PATH = __dirname + '/images/bmp.32.bmp';
var BMP_24_PATH = __dirname + '/images/bmp.24.bmp';
var UNDEFINED_PATH = __dirname + '/images/undefined.txt';

describe( '根据文件头判断文件类型', function(){

    it( 'JPEG测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( JPEG_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'jpg' );
        });
    });

    it( 'PNG测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( PNG_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'png' );
        });
    });

    it( 'GIF测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( GIF_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'gif' );
        });
    });

    it( 'BMP16测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( BMP_16_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'bmp' );
        });
    });

    it( 'BMP24测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( BMP_24_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'bmp' );
        });
    });

    it( 'BMP32测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( BMP_32_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( t ).toEqual( 'bmp' );
        });
    });

    it( '未定义格式测试', function(){

        var t;
        var e;
        var finished = false;

        runs(function(){
            Mime.parse( UNDEFINED_PATH, function( err, type ){
                e = err;
                t = type;
                finished = true;
            });
        });

        waitsFor( function(){

            return finished;
        });

        runs( function(){

            expect( typeof e ).toEqual( 'undefined' );
            expect( typeof t ).toEqual( 'undefined' );
        });
    });
});
