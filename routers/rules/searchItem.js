var DB = require( '../../database/' );
var API = require( '../../api/api.js' );

/**
 * @param title 商品标题中需要包含的关键词
 * @param desc 商品表述中需要包含的关键词
 * @param address 商品地址中需要包含的关键词
 * @param location 用户的坐标 用逗号隔开
 * @param maxDistance 根据用户坐标的搜索范围 若该值不给定，则直接寻找与location相等的项目
 * @param price 用户价格的值，与priceType一起使用
 * @param priceType 价格比较类型 todo 添加多条件，用逗号隔开
 * @param ids 直接制定需要获取的所有id对应的item,用逗号隔开
 * @param id 直接制定itemid，该字段给定后将直接忽略另外两个字段
 * @param len 最多获取的item数量
 * @param fields 需要获取的字段 用逗号隔开
 * @return { items: [ 有len指定的item ], ids: [ 所有的结果item的_id值]
 */
var searchItem = {

    type: 'get',
    rule: '/searchitem',
//        middleware: [ 'shouldLogin' ],

    fn: function ( req, res ){

        // 商品搜索query 直接使用js表达式，比如 'this.price > 200'
        var query = req.query;
        var queryObj = {};
        var queryField = undefined;
        var queryValue = undefined;
        var fields = query.fields ? query.fields.split( ',' ) : [];

        // 最多获取的items数量
        var maxLen = isNaN( parseInt( req.query.len ) ) ? 10 : parseInt( req.query.len );
        var itemHandle = new DB.item();
        var itemCount = 0;
        var _items = [];
        var _ids = [];

        itemHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'searchItem',
                error: msg,
                data: error
            });
        });

        for( queryField in query ){

            queryValue = query[ queryField ];

            switch( queryField ){
                case 'location':
                case 'ids': {
                    queryObj[ queryField ] = queryValue.split( ',' );
                    break;
                }
                case 'title':
                case 'desc':
                case 'address':
                case 'price':
                case 'priceType':
                case 'id':
                case 'maxDistance': {
                    queryObj[ queryField ] = queryValue;
                    break;
                }
                default: {
                    break;
                }
            }
        }

        itemHandle.query( queryObj, fields, function ( items ){

            // items被json化后无法找到imgs成员
            // 先把每个item的数据部分转化出来
            items.forEach(function ( item ){

                var _item = item.toJSON();

                if( itemCount < maxLen ){

                    _item.imgs = item.imgs;
                    _item.user = item.user;

                    _items.push( _item );

                    itemCount++;
                }

                _ids.push( _item._id );
            });

            API.send( req, res, {
                result: true,
                type: 'searchItem',
                error: undefined,
                data: {
                    items: _items,
                    ids: _ids
                }
            });
        });
    }
};

exports.rule = searchItem;