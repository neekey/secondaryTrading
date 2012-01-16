
/**
 * Session Instance api单元测试
 */

var Session = require( '../../session/' );
var SessionExpired = 2000;

// 设置过期时间，便于测试
Session.setExpired( SessionExpired );

describe( 'session数据实例化单元测试', function(){

    var sessionContent = {
        name: 'newSessionTest',
        content: 'only for test'
    };
    var sessionId, instance, sessionData;

    sessionId = Session.newSession( sessionContent );
    sessionData = Session.getSession( sessionId );
    instance = Session.getInstance( sessionId );

    it( '实例化测试', function(){

        // 通过检查实力对象的相关方法和属性是否存在来验证实力对象是否正确
        runs( function(){

            expect( instance.id ).toEqual( sessionId );
            expect( instance.session ).toEqual( sessionData );
            expect( typeof instance.get ).toEqual( 'function' );
            expect( typeof instance.set ).toEqual( 'function' );
            expect( typeof instance.destroy ).toEqual( 'function' );
        });
    });

    it( 'get测试', function(){

        var name = instance.get( 'name' );
        var content = instance.get( 'content' );

        expect( name ).toEqual( sessionContent.name );
        expect( content ).toEqual( sessionContent.content );
    });

    it( 'set测试', function(){

        var newName = 'neekey';
        var newContent = 'hello world';
        var newSexValue = 'male';

        instance.set( 'name', newName );

        expect( instance.get( 'name' ) ).toEqual( newName );

        instance.set( {
            content: newContent,
            sex: newSexValue
        });

        expect( instance.get( 'content' ) ).toEqual( newContent );
        expect( instance.get( 'sex' ) ).toEqual( newSexValue );
    });

    it( 'destroy测试', function(){

        instance.destroy();

        expect( typeof Session.getSession( sessionId ) ).toEqual( 'undefined' );
    });
});
