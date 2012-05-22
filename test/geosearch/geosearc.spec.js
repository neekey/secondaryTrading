/**
 * 商品种类
 */

// 数据库连接
require( '../../database/mongoConf' );

var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

var Location = new schema({
    // 地点位置
    name: { type: String, required: true },
    // 位置GPS坐标
    location: { type: Array, index: "2d" }
});

mongoose.model( 'location', Location );

var LocationModel = mongoose.model( 'location' );
var earthRadius = 6378; // km

var TestData = [
    {
        name: '浙江工业大学',  // 0
        location: [ 120.02992629999994, 30.2244392 ]
    },
    {
        name: '纽约',  // 17687
        location: [ -74.0059731, 40.7143528 ]
    },
    {
        name: '浙江省温州',  // 327
        location: [ 120.68499999999995, 27.98 ]
    },
    {
        name: '杭州鼓荡', // 12.2
        location: [ 120.12440500000002, 30.275874 ]
    },
    {
        name: '浙江省中医院下沙院区', // 40.4
        location: [ 120.35459270000001, 30.3041019 ]
    },
    {
        name: '阿里巴巴总部', // 15
        location: [ 120.18971299999998, 30.18886 ]
    }
];


//describe( '地理位置搜索测试', function(){
//
//    it( '浙江工业大学-鼓荡', function(){
//
//
//    });
//});

LocationModel.find( { location: { $nearSphere: TestData[ 0 ].location, $maxDistance: getDistance( 16 ) } }, function ( err, results ){

    console.log( arguments );
});

function getDistance( km ){

    return km / earthRadius;
}