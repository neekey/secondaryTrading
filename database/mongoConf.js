var mongoose = require('mongoose');

var HOST = 'localhost',
    PORT = '27017',
    DATABASE = 'secondary_trade';

// 连接
mongoose.connect( HOST, DATABASE, PORT );

