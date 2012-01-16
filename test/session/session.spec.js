/**
 * Session api单元测试
 */

var Session = require( '../../session/' );
var SessionExpired = 2000;

// 设置过期时间，便于测试
Session.setExpired( SessionExpired );

describe( 'session单元测试', function(){

    it( 'uuid测试', function(){

        var id1, id2, id3;

        runs( function(){

            id1 = Session.uuid();
            id2 = Session.uuid();
        });

        waits(1000);

        runs( function(){

            id3 = Session.uuid();
        });

        runs( function(){

            expect(id1).not.toEqual(id2);
            expect(id1).not.toEqual(id3);
            expect(id2).not.toEqual(id3);
        });
    });

    it( 'newSession测试', function(){

        var sessionContent = {
            name: 'newSessionTest',
            content: 'only for test'
        };
        var sessionId;

        // 生成新的session
        runs( function(){

            sessionId = Session.newSession( sessionContent );
        });

        // 检查session是否正确生成
        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).not.toEqual( 'undefined' );
            expect( s.name ).toEqual( sessionContent.name );
            expect( s.content ).toEqual( sessionContent.content );
        });

        // 等待session过期
        waits( SessionExpired + 1000 );

        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).toEqual( 'undefined' );
        });
    });

    it( 'delSession测试', function(){

        var sessionContent = {
            name: 'newSessionTest',
            content: 'only for test'
        };
        var sessionId;

        // 生成新的session
        runs( function(){

            sessionId = Session.newSession( sessionContent );
        });

        // 检查session是否生成
        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).not.toEqual( 'undefined' );
        });

        // 删除session
        runs( function(){

            Session.delSession( sessionId );

            var s = Session.getSession( sessionId );
            expect( typeof s ).toEqual( 'undefined' );
        });
    });

    it( 'clearTimer测试', function(){

        var sessionContent = {
            name: 'newSessionTest',
            content: 'only for test'
        };
        var sessionId;

        // 生成新的session
        runs( function(){

            sessionId = Session.newSession( sessionContent );
        });

        // 检查session是否正确生成
        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).not.toEqual( 'undefined' );
        });

        // 清除掉过期时间Timer
        runs( function(){

            Session.clearTimer( sessionId );
        });

        // 等待session过期时间
        waits( SessionExpired + 1000 );

        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).not.toEqual( 'undefined' );
        });
    });

    it( 'updateTimer测试', function(){

        var sessionContent = {
            name: 'newSessionTest',
            content: 'only for test'
        };
        var sessionId;

        // 生成新的session
        runs( function(){

            sessionId = Session.newSession( sessionContent );
        });

        // 检查session是否正确生成
        runs( function(){

            var s = Session.getSession( sessionId );

            expect( typeof s ).not.toEqual( 'undefined' );
        });

        // 等待session过期
        waits( SessionExpired - 1000 );

        // 检查是否过期（应该没有过期）更新过期时间,
        runs( function(){

            var s = Session.getSession( sessionId );
            expect( typeof s ).not.toEqual( 'undefined' );

            var s = Session.updateTimer( sessionId );
        });

        // 再等待1s
        waits( 1000 );

        // 检查是否过期,应该没有过期
        runs( function(){

            var s = Session.getSession( sessionId );
            expect( typeof s ).not.toEqual( 'undefined' );
        });

        waits( SessionExpired - 1000 );

        // 检查是否过期，应该过期了
        runs( function(){

            var s = Session.getSession( sessionId );
            expect( typeof s ).toEqual( 'undefined' );
        });
    });
});
