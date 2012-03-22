var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 用户表
var Image = new schema({
    itemId: { type: schema.ObjectId },
    path: { type: String }, // 文件储存路径
    mime: { type: String },
    type: { type: String }, // 后缀名
    size: { type: Number }  // 字节数
});

mongoose.model( 'image', Image );
