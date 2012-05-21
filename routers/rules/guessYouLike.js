var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

/**
 * 静态图片路由
 * @param id 图片的id
 * @type {Object}
 */
var guessYouLike = {
    type: 'get',
    rule: '/guessyoulike',
//    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        // 获取用户信息
        var newImg = new DB.image();
        var itemHandle = new DB.item();
        var userHandle = new DB.user();
        var body = req.body;
        var auth = new Auth();
        var userInfo = auth.getAuthInfo( req );
        var userId = userInfo.id;

        userHandle.getById( userId, function ( user ){

            var location = user.location;
            var favorite = user.favorite;

            // 若位置信息和用户偏好都不存在，则无法推荐，返回空数组
            if( !location && !favorite ){

                API.send( req, res, {
                    result: true,
                    type: 'guessyoulike',
                    data: []
                });

                return;
            }

            var queryObj = {};

            if( location ){

                queryObj[ 'location' ] = location;
                queryObj[ 'maxDistance' ] = 5000000;
            }

            if( favorite ){

                queryObj[ 'category' ] = favorite;
            }

            itemHandle.query( queryObj, function ( items ){


            });
        });

    }
};

function filter( userHandle, user, items, max, next ){

    var len = items.len;
    var count = 0;

    items.forEach(function ( item ){

        estimate( userHandle, user, item, function ( score ){

            count++;
            item.score = score;

            // 所有评估值均计算完毕，对结果进行排序
            if( count === len ){

                items.sort(function ( a, b ){

                    return a.score - b.score;
                });

                // 截取max个
                next( items.splice( 0, max ) );
            }
        });
    });
}

function estimate( userHandle, user, item, next ){

    var userLocation = user.location;
    var price = item.price;
    var itemLocation = item.location;
    var sellerId = item.userId;

    // 获取seller信息
    userHandle.getById( sellerId, function ( seller ){

        var sellerLocation = seller.location;
        var address = seller.address;
        var cellphone = seller.cellphone;
        var qq = seller.qq;
        var wangwang = seller.wangwang;

        // 计算卖家与买家的距离

        // 评估卖家的个人信息详细程度

        // 计算得到评估值, next 返回
    });
}



exports.rule = guessYouLike;