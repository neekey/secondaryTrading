/**
 * 二手商品
 */

var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 商品表
var Item = new schema({
    userId: { type: schema.ObjectId, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String, required: true },
    // GPS 坐标 [ latitude, longitude ]
    location: { type: Array, index: '2d' },
    address: { type: String },
    postDate: { type: Date },
    // 商品类别
    category: { type: String }
});

mongoose.model( 'item', Item );

