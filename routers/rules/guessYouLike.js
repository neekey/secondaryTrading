var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

/**
 * 对用户进行智能推荐
 * @param location {String} longitude,latitude
 */
var guessYouLike = {
    type: 'get',
    rule: '/guessyoulike',
    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        // 获取用户信息
        var itemHandle = new DB.item();
        var userHandle = new DB.user();
        var userLocation = req.query.location;
        var auth = new Auth();
        var userInfo = auth.getAuthInfo( req );
        var userId = userInfo.id;

        itemHandle.on( '_error', function ( msg, err ){

            API.send( req, res, {
                result: false,
                type: 'guessyoulike',
                error: msg,
                data: err
            });
        });

        userHandle.on( '_error', function ( msg, err ){

            API.send( req, res, {
                result: false,
                type: 'guessyoulike',
                error: msg,
                data: err
            });
        });

        userHandle.getById( userId, function ( user ){

            var location;

            if( userLocation && userLocation.length > 0 ){

                location = userLocation.split( ',' );
                location = [ parseFloat( location[ 0 ] ), parseFloat( location[ 1 ] ) ];
            }
            else {

                location = user.location;
            }
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

            if( location && location.length > 0  ){

                queryObj[ 'location' ] = location;
                // 默认取20km距离内的商品
                queryObj[ 'maxDistance' ] = 20;
            }

            if( favorite && favorite.length > 0 ){

                queryObj[ 'category' ] = favorite;
            }

            itemHandle.query( queryObj, function ( items ){

                filter( userHandle, user, items, 10, function ( results ){

                    API.send( req, res, {
                        result: true,
                        type: 'guessyoulike',
                        data: results
                    });
                });
            });
        });

    }
};

/**
 * 对所有的结果进行评估，根据评估值的从大到小排序，返回
 * @param userHandle
 * @param user
 * @param items
 * @param max 指定最多返回的数量
 * @param next( items )
 */
function filter( userHandle, user, items, max, next ){

    items = items || [];
    var len = items.length;
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

    // 所有评估值均计算完毕，对结果进行排序
    if( count === len ){

        items.sort(function ( a, b ){

            return a.score - b.score;
        });

        // 截取max个
        next( items.splice( 0, max ) );
    }
}

/**
 * 对商品进行评估，返回评估值
 * @param userHandle
 * @param user
 * @param item
 * @param next( score )
 */
function estimate( userHandle, user, item, next ){

    // 20km内的距离在0.2左右
    // 商品距离( 55% ) + 卖家距离( 35% ) + 卖家质量( 10% )
    // 0.1 / ( 0.1 + 0.2 ) * 55 + 0.1 / ( 0.1 + 0.2 ) * 35 + 1 * 10
    var itemDistanceWeight = 55;
    var sellerDistanceWeight = 35;
    var sellerInfoScoreWeight = 10;

    var userLocation = user.location;
    // 先不考虑价格，因为不同商品的价格相差太大（几十或者几百万），对评估值的影响太大
//    var price = item.price;
    var itemLocation = item.location;
    // 计算 商品与用户之间的距离
    var itemDistance = ( itemLocation && itemLocation.length > 0 ) ?
        Math.sqrt( Math.pow( userLocation[ 0 ] - itemLocation[ 0 ], 2 ) + Math.pow( userLocation[ 1 ] - itemLocation[ 1 ], 2 ) ) : undefined;

    var sellerId = item.userId;

    // 获取seller信息
    userHandle.getById( sellerId, function ( seller ){

        var sellerLocation = seller.location;

        // 计算卖家与买家的距离
        var sellerDistance = ( sellerLocation && sellerLocation.length > 0 ) ?
            Math.sqrt( Math.pow( userLocation[ 0 ] - sellerLocation[ 0 ], 2 ) + Math.pow( userLocation[ 1 ] - sellerLocation[ 1 ], 2 ) ) : undefined;

        // 评估卖家的个人信息详细程度
        var sellerInfoScore = sellerInfoEstimate( seller );

        // 计算得到评估值, next 返回
        var itemDistanceScore = ( itemDistance === undefined  ) ? 0 : ( 0.1 / ( 0.1 + itemDistance ) * itemDistanceWeight );
        var sellerDistanceScore = ( sellerDistance === undefined ) ? 0 : ( 0.1 / ( 0.1 + sellerDistance ) * sellerDistanceWeight );
        var sellerInfoFinalScore = sellerInfoScore * sellerInfoScoreWeight;

        next(  itemDistanceScore + sellerDistanceScore + sellerInfoFinalScore );
    });
}

/**
 * 对卖家的个人信息完整性进行评估
 * @param seller
 * @return {Number} 0 - 1
 */
function sellerInfoEstimate( seller ){

    var scoreObj = {
        sex: 0.05,
        location: 0.2,
        address: 0.25,
        cellphone: 0.3,
        qq: 0.1,
        wangwang: 0.1
    };
    var score = 0;

    var field;

    for( field in scoreObj ){

        if( seller[ field ] ){

            score += scoreObj[ field ];
        }
    }

    return score;
}



exports.rule = guessYouLike;