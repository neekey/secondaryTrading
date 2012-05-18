var DB = require( '../../database/' );
var waitsForTimeout = 5000;

describe('商品分类测试', function(){

    var newCatObj = CatFactory( 'add', 'custom' );

    it( 'add-添加分类', function(){

        var ctHandle = new DB.category();
        var newCat;
        var err;
        var errMsg;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '添加新分类' );

            ctHandle.add( newCatObj, function ( cat ){

                newCat = cat;
            });
        });

        waitsFor(function (){

            return newCat;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别添加完毕' );

            expect( err).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });


        // 测试重复添加的情况
        runs(function(){

            newCat = undefined;
            err = undefined;
            errMsg = undefined;

            jasmine.log( '重复添加一次' );

            ctHandle.add( newCatObj, function ( cat ){

                newCat = cat;
            });
        });

        waitsFor(function (){

            return newCat;
        });

        runs(function(){

            jasmine.log( '重复添加完毕' );

            expect( err).toBe( undefined );
            expect( errMsg ).toBe( undefined );
            expect( newCat).not.toBe( undefined );
            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount + 1 );

            newCatObj.itemcount++;
        });
    });

    it( 'getByName-查找分类', function(){

        var ctHandle = new DB.category();
        var newCat;
        var err;
        var errMsg;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '根据name查找' );

            ctHandle.getByName( newCatObj.name, function ( cat ){

                newCat = cat || null;
            });
        });

        waitsFor(function (){

            return newCat !== undefined;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别查找完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).not.toBe( undefined );
            expect( newCat ).not.toBe( null );
            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });
    });

    it( 'update-修改分类', function(){

        var ctHandle = new DB.category();
        var updateCatObj = {
            name: newCatObj.name + 'update',
            type: newCatObj.type === 'preset' ? 'custom' : 'preset',
            itemcount: newCatObj.itemcount++
        };
        var newCat;
        var err;
        var errMsg;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '根据name修改' );

            ctHandle.update( { name: newCatObj.name }, updateCatObj, function ( cats ){

                newCat = cats[ 0 ];
            });
        });

        waitsFor(function (){

            return newCat !== undefined || err;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别查找完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).not.toBe( undefined );
            expect( newCat.name ).toEqual( updateCatObj.name );
            expect( newCat.type ).toEqual( updateCatObj.type );
            expect( newCat.itemcount ).toEqual( updateCatObj.itemcount );

            // 更新一下，以便下面需要
            newCatObj = updateCatObj;
        });
    });

    it( 'updateItemCount-修改分类', function(){

        var ctHandle = new DB.category();
        var newCat;
        var countAdd = 5;
        var countMinus = 4;
        var countEqual = 10;
        var err;
        var errMsg;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '修改item count / +' );

            // 重置
            newCat = undefined;
            err = undefined;
            errMsg = undefined;

            newCatObj.itemcount += countAdd;
            ctHandle.updateItemCount( { name: newCatObj.name }, '+' + countAdd, function ( cats ){

                newCat = cats[ 0 ];
            });
        });

        waitsFor(function (){

            return newCat !== undefined || err;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别修改完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).not.toBe( undefined );
            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });

        runs(function(){

            jasmine.log( '修改item count / -' );

            // 重置
            newCat = undefined;
            err = undefined;
            errMsg = undefined;

            newCatObj.itemcount -= countMinus;
            ctHandle.updateItemCount( { name: newCatObj.name }, '-' + countMinus, function ( cats ){

                newCat = cats[ 0 ];
            });
        });

        waitsFor(function (){

            return newCat !== undefined || err;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别修改完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).not.toBe( undefined );
            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });

        runs(function(){

            jasmine.log( '修改item count / =' );

            // 重置
            newCat = undefined;
            err = undefined;
            errMsg = undefined;

            newCatObj.itemcount = countEqual;
            ctHandle.updateItemCount( { name: newCatObj.name }, '=' + countEqual, function ( cats ){

                newCat = cats[ 0 ];
            });
        });

        waitsFor(function (){

            return newCat !== undefined || err;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别修改完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).not.toBe( undefined );
            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });
    });

    it( 'del-删除分类', function(){

        var ctHandle = new DB.category();
        var newCat;
        var err;
        var errMsg;
        var delFinished = false;
        var getCatFinished = false;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '根据name删除' );

            ctHandle.del( { name: newCatObj.name }, function ( cat ){

                delFinished = true;
            });
        });

        waitsFor(function (){

            return delFinished;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '重新查询' );

            ctHandle.getByName( { name: newCatObj.name }, function ( cat ){

                newCat = cat;
                getCatFinished = true;
            });
        });

        waitsFor(function (){

            return getCatFinished;
        });

        runs(function(){

            jasmine.log( '类别查找完毕' );

            expect( err ).toBe( undefined );
            expect( errMsg).toBe( undefined );
            expect( newCat ).toBe( undefined );
        });
    });

    // 测试当一个类别的 itemcount被修改为0后是否会自动删除
    it( 'updateItemCount-custom-count修改为0后', function(){

        var ctHandle = new DB.category();
        var newCatObj = CatFactory( 'upadteItemCount', 'custom' );
        var newCat;
        var err;
        var errMsg;
        var updateFinished = false;

        newCatObj.itemcount = 2;

        ctHandle.on( '_error', function ( msg, e ){

            err = e;
            errMsg = msg;
        });

        runs(function(){

            jasmine.log( '添加新分类' );

            ctHandle.add( newCatObj, function ( cat ){

                newCat = cat;
            });
        });

        waitsFor(function (){

            return newCat;

        }, waitsForTimeout );

        runs(function(){

            jasmine.log( '类别添加完毕' );

            expect( err).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat.name ).toEqual( newCatObj.name );
            expect( newCat.type ).toEqual( newCatObj.type );
            expect( newCat.itemcount ).toEqual( newCatObj.itemcount );
        });

        runs(function(){

            jasmine.log( '修改item count / -' );

            ctHandle.updateItemCount( { name: newCatObj.name }, '-2', function ( cats ){

                updateFinished = true;
            });
        });

        waitsFor(function (){

            return updateFinished || err;

        }, waitsForTimeout );

        runs(function(){

            // 重置
            newCat = undefined;
            err = undefined;
            errMsg = undefined;

            jasmine.log( '类别修改完毕/查找之' );

            ctHandle.getByName( newCatObj.name, function ( cat ){

                newCat = cat || null;
            });
        });

        waitsFor(function (){

            return newCat !== undefined || err;
        });

        runs(function(){

            jasmine.log( '检查是否已经被删除' );

            expect( err).toBe( undefined );
            expect( errMsg).toBe( undefined );

            expect( newCat ).toEqual( null );
        });
    });
});

/**
 * 创建新的category数据
 * @param testType
 * @param type
 * @return {Object}
 */
function CatFactory( testType, type ){

    return {
        name: 'jasmine-test-category-name' + testType + Date.now(),
        type: type || 'custom',
        itemcount: 0
    };
}