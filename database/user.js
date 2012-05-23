var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 用户表
var user = new schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sex: { type: String, 'default': 'male' },
    // GPS 坐标 [ latitude, longitude ]
    location: { type: Array, index: '2d' },
    address: { type: String },
    cellphone: { type: Number },
    qq: { type: Number },
    wangwang: { type: String },
    // 用户感兴趣的类别，用户可以自己添加，也可以通过一定的算法动态修改
    favorite: [ String ]
});

mongoose.model( 'user', user );

