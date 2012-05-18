require( './mongoConf' );

module.exports = {

    user: require( './userHandle' ),
    item: require( './itemHandle' ),
    image: require( './imageHandle' ),
    category: require( './categoryHandle' )
};

// 添加初始化分类数据
require( './categoryDefault' );

/*==== 规范 ====

    每个模块都需要济城EventEmitter
    所有的错误作为'_error'的形式抛出，返回的参数( msg, err )
    所有成功的操作直接以回调形式返回,参数中不需要err
*/