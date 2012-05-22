/**
 * db.user下的api，单元测试
 */

var DB = require( '../../database/' );
var waitsForTimeout = 5000;

describe( '用户操作接口', function(){

    it( '添加用户(没有options)', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var userAddFinished = false;
        var userGetFinished = false;
        var user;

        // 添加新用户
        runs(function(){
            User.add( email, password, function(){
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
            User.get( email, function( u ){
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
            expect( user.sex ).toEqual( 'male' );
        });
    });

    it( '添加用户(包含options)', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add_with_options' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add_with_options' + Date.now();
        var options = {
            sex: 'male',
            location: [ 120 + Math.random(), 30 + Math.random() ],
            cellphone: 15158133775,
            qq: 184775761,
            wangwang: '49808239898',
            favorite: [ '自行车', '数码产品', '健身用品' ]
        };
        var userAddFinished = false;
        var userGetFinished = false;
        var user;

        // 添加新用户
        runs(function(){
            User.add( email, password, options, function(){
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
            User.get( email, function( u ){
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
            expect( JSON.stringify( user.favorite ) ).toEqual( JSON.stringify( options.favorite ) );
        });
    });

    it( '重复（email）添加用户', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var userAddFinished = false;
        var userGetFinished = false;
        var dulpEmailError = false;
        var error;
        var user;

        // 添加新用户
        runs(function(){
            User.add( email, password, function(){
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
            User.get( email, function( u ){
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
            expect( user.sex ).toEqual( 'male' );
        });

        // 监听错误
        runs(function(){
            User.on( '_error', function( _error ){
                error = _error;
                dulpEmailError = true;
            });
        });

        // 再次添加用户
        runs(function(){
            User.add( email, password );
        });

        waitsFor( function(){
            return dulpEmailError;
        }, '重复添加用户超时或者重复添加用户成功了:' + email, waitsForTimeout );

        runs(function(){
            // 错误事件被触发并且error对象存在
            expect( dulpEmailError ).toEqual( true );
            expect( typeof error ).not.toEqual( undefined );
        });
    });

    it( '根据id获取用户', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var userAddFinished = false;
        var userGetFinished = false;
        var user;
        var userId;

        // 添加新用户
        runs(function(){
            User.add( email, password, function( user ){
                userAddFinished = true;
                userId = user._id;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });

        // 根据用户id重新从数据库中获取用户
        runs(function(){
            User.getById( userId, function( u ){
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
            expect( user.sex ).toEqual( 'male' );
        });
    });

    it( 'updateById', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var updateObj = {
            sex: 'male',
            cellphone: 18797080,
            qq: 909287970,
            wangwang: '50982095809285',
            location: [ 120 + Math.random(), 30 + Math.random() ],
            address: 'jasmine_user_api_updateById' + Date.now() + '_address'
        };
        var userAddFinished = false;
        var userUpdateFinished = false;
        var userGetFinished = false;
        var user;
        var userId;

        // 添加新用户
        runs(function(){
            User.add( email, password, function( user ){
                userAddFinished = true;
                userId = user._id;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });

        // 根据用户id重新从数据库中获取用户
        runs(function(){
            User.getById( userId, function( u ){
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
            expect( user.sex ).toEqual( 'male' );
            expect( user.address ).toEqual( undefined );
            expect( user.location.length ).toBe( 0 );
            expect( user.cellphone ).toEqual( undefined );
            expect( user.qq ).toEqual( undefined );
            expect( user.wangwang ).toEqual( undefined );

        });

        // 根据用户id更新用户信息
        runs(function(){
            User.updateById( userId, updateObj, function( u ){

                user = u;
                userUpdateFinished = true;
            });
        });

        // 等待更新用户的操作完成
        waitsFor( function(){
            return userUpdateFinished;
        }, '更新用户:' + email + '超时', waitsForTimeout );

        runs(function(){
            expect( user.email ).toEqual( email );
            expect( user.password ).toEqual( password );
            expect( user.sex ).toEqual( updateObj.sex );
            expect( user.address ).toEqual( updateObj.address );
            expect( user.location[ 0 ] ).toEqual( updateObj.location[ 0 ] );
            expect( user.location[ 1 ] ).toEqual( updateObj.location[ 1 ] );
            expect( user.cellphone ).toEqual( updateObj.cellphone );
            expect( user.qq ).toEqual( updateObj.qq );
            expect( user.wangwang ).toEqual( updateObj.wangwang );
        });
    });

    it( 'updateByEmail', function(){

        var User = new DB.user();

        var email = 'jasmine_user_api_add' + Date.now() + '@gmail.com';
        var password = 'jasmine_user_api_add' + Date.now();
        var updateObj = {
            sex: 'male',
            cellphone: 18797080,
            qq: 909287970,
            wangwang: '50982095809285',
            location: [ 120 + Math.random(), 30 + Math.random() ],
            address: 'jasmine_user_api_updateById' + Date.now() + '_address',
            favorite: [ '鞋包', '生活用品', '护肤品' ]
        };
        var userAddFinished = false;
        var userUpdateFinished = false;
        var userGetFinished = false;
        var user;
        var userId;

        // 添加新用户
        runs(function(){
            User.add( email, password, function( user ){
                userAddFinished = true;
                userId = user._id;
            });
        });

        // 等待添加操作完成
        waitsFor(function(){
            return userAddFinished;
        }, '添加用户:' + email + ' 超时', waitsForTimeout );

        runs(function(){
            expect( userAddFinished ).toEqual( true );
        });

        // 根据用户id重新从数据库中获取用户
        runs(function(){
            User.getById( userId, function( u ){
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
            expect( user.sex ).toEqual( 'male' );
            expect( user.address ).toEqual( undefined );
            expect( user.location.length ).toBe( 0 );
            expect( user.cellphone ).toEqual( undefined );
            expect( user.qq ).toEqual( undefined );
            expect( user.wangwang ).toEqual( undefined );

        });

        // 根据用户email更新用户信息
        runs(function(){
            User.updateByEmail( email, updateObj, function( u ){

                user = u;
                userUpdateFinished = true;
            });
        });

        // 等待更新用户的操作完成
        waitsFor( function(){
            return userUpdateFinished;
        }, '更新用户:' + email + '超时', waitsForTimeout );

        runs(function(){
            expect( user.email ).toEqual( email );
            expect( user.password ).toEqual( password );
            expect( user.sex ).toEqual( updateObj.sex );
            expect( user.address ).toEqual( updateObj.address );
            expect( user.location[ 0 ] ).toEqual( updateObj.location[ 0 ] );
            expect( user.location[ 1 ] ).toEqual( updateObj.location[ 1 ] );
            expect( user.cellphone ).toEqual( updateObj.cellphone );
            expect( user.qq ).toEqual( updateObj.qq );
            expect( user.wangwang ).toEqual( updateObj.wangwang );
        });
    });
});
