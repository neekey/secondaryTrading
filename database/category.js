/**
 * 商品种类
 */

var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

var Category = new schema({
    name: { type: String, required: true },
    // 类型: 预置 preset 用户自定义 custom
    // 预置分类是会显示在用户出售商品时的类别菜单中，而自定义则由用户自行填写，会被用来做宝贝匹配
    type: { type: String, required: true, 'default': 'custom' },
    // 该分类下的商品数量
    // 若一个自定义分类下商品下降到0，将会被删除
    itemcount: { type: Number, 'default': 0 }
});

mongoose.model( 'category', Category );