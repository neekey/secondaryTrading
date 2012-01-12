/**
 * db.user下的api，单元测试
 */

var DB = require( '../../database/' );
var waitsForTimeout = 5000;

describe( '用户操作接口', function(){

    it( '添加用户(没有options)', function(){

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var userAddFinished = false;
        var userGetFinished = false;
        var user;

        // 添加新用户
        runs(function(){
            DB.user.add( email, password, function(){
                userAddFinished = true;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });

        // 重新从数据库中获取用户
        runs(function(){
            DB.user.get( email, function( u ){
                user = u;
                userGetFinished = true;
            });
        });

        // 等待获取用户的操作完成
        waitsFor( function(){
            return userGetFinished;
        }, '获取用户:' + email + '超时', waitsForTimeout );

        runs(function(){
            expect( user.email ).toEqual( email );
            expect( user.password ).toEqual( password );
            expect( user.sex ).toEqual( 'undefined' );
        });
    });

    it( '添加用户(包含options)', function(){

        var email = 'jasmine_user_api_add_with_options' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add_with_options' + Date.now();
        var options = {
            sex: 'male',
            location: [ 1234, 4567.1223339999 ],
            cellphone: 15158133775,
            qq: 184775761,
            wangwang: 49808239898
        };
        var userAddFinished = false;
        var userGetFinished = false;
        var user;

        // 添加新用户
        runs(function(){
            DB.user.add( email, password, options, function(){
                userAddFinished = true;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });

        // 重新从数据库中获取用户
        runs(function(){
            DB.user.get( email, function( u ){
                user = u;
                userGetFinished = true;
            });
        });

        // 等待获取用户的操作完成
        waitsFor( function(){
            return userGetFinished;
        }, '获取用户:' + email + '超时', waitsForTimeout );

        runs(function(){
            expect( user.email ).toEqual( email );
            expect( user.password ).toEqual( password );
            // 检查options是否正确
            expect( user.sex ).toEqual( options.sex );
            expect( user.qq ).toEqual( options.qq );
            expect( user.wangwang ).toEqual( options.wangwang );
            expect( user.cellphone ).toEqual( options.cellphone );
            expect( user.location[ 0 ] ).toEqual( options.location[ 0 ] );
            expect( user.location[ 1 ] ).toEqual( options.location[ 1 ] );
        });
    });
});
