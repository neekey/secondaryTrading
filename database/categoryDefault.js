/**
 * 添加默认的类别
 */
var CatHandle = require( './categoryHandle' );

// 默认分类，参考赶集网：http://www.ganji.com/pub/pub_select.php?domain=hz
var PresetCats = [
    '家具',
    '家用电器',
    '二手笔记本',
    '台式电脑/网络',
    '二手手机',
    '手机号',
    '电子数码',
    '闲置礼品',
    '母婴/儿童用品',
    '服饰/箱包',
    '图书/音乐/运动',
    '商用/办公',
    '物品交换',
    '收藏品/纪念品',
    '免费赠送',
    '其他物品',
    '农用品/农产品',
    '食品/保健品',
    '美容护肤/化妆品',
    '日用品',
    '自行车消费卡'
];

var catHandle = new CatHandle();

catHandle.on( '_error', function (){

    throw new Error( '初始化分类数据失败!' );
});

PresetCats.forEach( function ( catName ){

    catHandle.add({
        name: catName,
        type: 'preset',
        itemcount: 0
    });
});