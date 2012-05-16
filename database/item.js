/**
 * 二手商品
 */

var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 用户表
var Item = new schema({
    userId: { type: schema.ObjectId, required: true },
    title: { type: String },
    price: { type: Number, required: true },
    desc: { type: String, required: true },
    location: [ Number ],
    address: { type: String },
    postDate: { type: Date },
    // 商品类别
    category: { type: String }
});

mongoose.model( 'item', Item );

