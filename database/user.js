var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 用户表
var user = new schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sex: { type: String, 'default': 'male' },
    location: [ Number ],
    address: { type: String },
    cellphone: { type: Number },
    qq: { type: Number },
    wangwang: { type: String }
});

mongoose.model( 'user', user );

