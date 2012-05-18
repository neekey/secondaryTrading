/**
 * 二手商品图片的数据库操作
 */
require( './category' );

var mongoose = require( 'mongoose' );
var CategoryModel = mongoose.model( 'category' );
var EventEmitter = require('events').EventEmitter;
var Util = require( 'util' );
var _ = require( 'underscore' );

var categoryHandle = function(){

    EventEmitter.call( this );
};

Util.inherits( categoryHandle, EventEmitter );

_.extend( categoryHandle.prototype, {

    /**
     * 添加图片
     * @param {String|Object} catObj
     *  分类的name值或者一个完整的category数据
     *  若为string，则会自动构造为{ name: catObj, type: 'custom', itemcount: 0 }
     *  两种类型都会先查找对应的cat是否已经存在，如果不存在则新增，已经存在则itemcount++
     * @param next( cat )
     */
    add: function( catObj, next ){

        var that = this;
        var ifObj = typeof catObj === 'object';
        var catName = ifObj ? catObj.name : catObj;

        this.getByName( catName, function ( cat ){

            if( cat ){

                that.updateItemCount( { name: catName }, '+1', function ( cats ){

                    next( cats[ 0 ] );
                });
            }
            else {

                catObj = ifObj ? catObj : { name: catObj, type: 'custom', itemcount: 0 };

                var newCat = new CategoryModel( catObj );

                newCat.save( function ( err ){

                    if( err ){

                        that.emit( '_error', '添加分类出错', err );
                    }
                    else {

                        next( newCat );
                    }
                });
            }
        });

    },

    /**
     * 根据id删除图片
     * @param query
     * @param next( [ cat ] )
     */
    del: function( query, next ){

        var that = this;

        this.query( query, function ( cats ){

            if( cats.length === 0 ){

                next( [] );
            }
            else {

                var catCount = 0;
                var catLen = cats.length;
                var ifError = false;

                cats.forEach(function ( cat ){

                    cat.remove( function( err ){

                        catCount++;

                        if( err ){

                            // 若已经出错过，则后续都不再报错
                            if( !ifError ){

                                ifError = true;
                                that.emit( '_error', '删除分类出错！', err );
                            }
                        }
                        else {

                            // 若已经出错过，则不再重复执行回调
                            if( ifError === false && catCount === catLen ){

                                next( cats );
                            }
                        }
                    });
                });
            }
        });
    },

    /**
     * 更新图片信心
     * @param query
     * @param {Object|Function}
     *  updateObj 若为Object，则为更新的对象，若为function，则动态更新 function( cat ){ cat.name = 'neekey'; return cat }
     * @param next ( cats )
     */
    update: function( query, updateObj, next ){

        var that = this;

        this.query( query, function ( cats ){

            if( cats.length === 0 ){

                next( cats );
            }
            else {

                var catCount = 0;
                var catLen = cats.length;
                var ifError = false;
                var handle = typeof updateObj === 'function' ? updateObj : undefined;

                cats.forEach(function ( cat ){

                    if( handle ){

                        cat = handle( cat );
                    }
                    else {

                        cat.name = updateObj.name || cat.name;
                        cat.type = updateObj.type || cat.type;
                        cat.itemcount = updateObj.itemcount || cat.itemcount;
                    }

                    cat.save(function ( err ){

                        catCount++;

                        if( err ){

                            // 若已经出错过，则后续都不再报错
                            if( !ifError ){

                                ifError = true;
                                that.emit( '_error', '删除分类出错！', err );
                            }
                        }
                        else {

                            // 若已经出错过，则不再重复执行回调
                            if( ifError === false && catCount === catLen ){

                                next( cats );
                            }
                        }
                    });
                });
            }
        });
    },

    /**
     * 更新cat的itemcount值, todo 若发现count值修改后为0 且如果类别为 custom，则删除
     * @param query
     * @param updateCount 更改只  '+1' || '-1' || '=5'
     * @param next( cats )
     */
    updateItemCount: function ( query, updateCount, next ){

        var updateType = updateCount.substring( 0, 1 );
        var updateValue = parseInt( updateCount.substring( 1 ) );
        var that = this;

        this.update( query, function ( cat ){

            var newValue = cat.itemcount;

            switch( updateType ){
                case '+':
                    newValue += updateValue;
                    break;
                case '-':
                    newValue -= updateValue;
                    break;
                case '=':
                    newValue = updateValue;
                    break;
            }

            cat.itemcount = newValue;

            return cat;
        }, function ( cats ){

            if( cats.length === 0 ){

                next( [] );
            }
            else{

                var catLen = cats.length;
                var catCount = 0;

                cats.forEach( function ( cat ){

                    // custom类型的若itemcount为0则自动删除
                    if( cat.itemcount <= 0 && cat.type !== 'preset' ){

                        that.del( { name: cat.name }, function (){

                            catCount++;

                            if( catCount === catLen ){

                                next( cats );
                            }
                        });
                    }
                    else {

                        catCount++;

                        if( catCount === catLen ){

                            next( cats );
                        }
                    }
                });
            }
        } );
    },

    /**
     * 根据类别名称来搜索类别条目
     * @param name
     * @param next( cat ) 若没有结果 cat === undefined
     */
    getByName: function ( name, next ){

        this.query({ name: name }, function ( cats ){

            next( cats[ 0 ] );
        });
    },

    /**
     * 对分类进行检索
     * @param query
     * @param next ( cats )
     */
    query: function ( query, next ){

        var that = this;

        CategoryModel.find( query, function ( err, cats ){

            if( err ){

                that.emit( '_error', '查找条件为: ' + JSON.stringify( query ) + ' 的分类出错!', err );
            }
            else if( !cats || cats.length === 0 ){

                next( [] );
            }
            else {

                next( cats );
            }
        });
    }
});

module.exports = categoryHandle;