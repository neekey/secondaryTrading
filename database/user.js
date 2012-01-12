var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 用户表
var user = new schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sex: { type: String, 'default': 'undefined' },
    location: [ Number ],
    cellphone: { type: Number },
    qq: { type: Number },
    wangwang: { type: Number }
});

mongoose.model( 'user', user );

