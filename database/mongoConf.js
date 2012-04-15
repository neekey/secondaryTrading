var mongoose = require('mongoose');

var HOST = 'localhost',
    PORT = '27017',
    DATABASE = 'secondary_trade';

// 连接
mongoose.connect( HOST, DATABASE, PORT );

/*=== NAE Config ====
var USERNAME = 'hp1kqs5ct40np',
    PASSWORD = 'hjk2w1bv153',
    HOST = '127.0.0.1',
    PORT = '20088',
    DATABASE = 'KdSJmf3ZvQlx';
// 连接
mongoose.connect( 'mongodb://' + USERNAME + ':' + PASSWORD + '@' + HOST + ':' + PORT + '/' + DATABASE );

*/