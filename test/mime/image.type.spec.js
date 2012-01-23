
/**
 * Session Instance api单元测试
 */

var Mime = require( '../../mime/' );
var JPEG_PATH = 'images/jpeg.jpg';
var PNG_PATH = 'images/png.png';
var GIF_PATH = 'images/gif.gif';
var BMP_16_PATH = 'images/bmp.16.bmp';
var BMP_32_PATH = 'images/bmp.32.bmp';
var BMP_24_PATH = 'images/bmp.24.bmp';
var UNDEFINED_PATH = 'images/undefined.text';

describe( '根据文件头判断文件类型', function(){

    it( 'JPEG测试', function(){

        Mime.parse( JPEG_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'jpeg' );
        });
    });

    it( 'PNG测试', function(){

        Mime.parse( PNG_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'png' );
        });
    });

    it( 'GIF测试', function(){

        Mime.parse( GIF_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'gif' );
        });
    });

    it( 'BMP16测试', function(){

        Mime.parse( BMP_16_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'bmp' );
        });
    });

    it( 'BMP24测试', function(){

        Mime.parse( BMP_24_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'bmp' );
        });
    });

    it( 'BMP32测试', function(){

        Mime.parse( BMP_32_PATH, function( err, type ){

            expect( typeof err ).toEqual( 'undefined' );
            expect( typeof type ).toEqual( 'bmp' );
        });
    });
});
