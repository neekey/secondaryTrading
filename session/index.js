/**
 * 使用get/post方式实现的简单session
 */

var _ = require( 'underscore' );

var DEFAULT_SESSION_EXPIRED = 30 * 60 * 1000;
var SESSION_EXPIRED = DEFAULT_SESSION_EXPIRED;
var SESSION_ID_PREFIX = 'secondaryTrading-';
var SESSION_FIELD_NAME = 'secondary_trading_session_id';
var RES_SESSION_FIELD_NAME = 'secondary_trading_session';
var SESSION_UUID_COUNTER = 0;

/**
 * sessionId
 */
var _Session = {
};

var _SessionTimer = {
}

var Session = {

    fieldId: SESSION_FIELD_NAME,
    resFieldId: RES_SESSION_FIELD_NAME,

    setExpired: function( s ){

        if( typeof s === 'number' ){

            SESSION_EXPIRED = s;
        }
        else {

            SESSION_EXPIRED = DEFAULT_SESSION_EXPIRED;
        }
    },

    /**
     * 生成sessionId
     */
    uuid: function(){
        return SESSION_ID_PREFIX + Date.now() + '_' + ++SESSION_UUID_COUNTER;
    },

    /**
     * 返回session数据，若id不给定，则返回整个session数据对象
     * @param id
     */
    getSession: function( id ){

        if( id ){
            
            return _Session[ id ];
        }
        else {

            return _Session;
        }
    },

    /**
     * 根据sessionid生成对应的session实例
     * @param id
     * @return SessionInstance
     */
    getInstance: function( id ){

        if( _Session[ id ] ){

            return new SessionInstance( id );
        }
    },

    /**
     * 销毁session
     * @param id
     */
    delSession: function( id ){

        delete _Session[ id ];
    },

    /**
     * 根据给定内容生成新的session数据
     * @param s
     * @return id
     */
    newSession: function( s ){

        var id = this.uuid();
        var that = this;
        
        s = s || {};

        _Session[ id ] = s;

        this.updateTimer( id );

        return id;
    },

    /**
     * 更新session过期timer
     * @param id
     */
    updateTimer: function( id ){

        var that = this;

        clearTimeout( _SessionTimer[ id ] );

        _SessionTimer[ id ] = setTimeout(function(){

            that.delSession( id );
        }, SESSION_EXPIRED );
    },

    /**
     * 清除session过期timer
     * @param id
     */
    clearTimer: function( id ){

        clearTimeout( _SessionTimer[ id ] );
    }
};

/**
 * session实例对象构造函数
 * @param id
 */
var SessionInstance = function( id ){

    this.id = id;
    this.session = _Session[ id ];
    Session.updateTimer();
};

SessionInstance.prototype = {

    /**
     * 返回指定的session字段值ֵ
     * @param name
     */
    get: function( name ){

        return this.session[ name ];
    },

    /**
     * 设置session，可以用key/value形式，也可以传入object
     * @param name
     * @param value
     */
    set: function( name, value ){

        var Obj;

        if( typeof name === 'string' && value ){

            this.session[ name ] = value;
        }

        if( name.constructor === Object ){

            obj = name;

            for( name in obj ){

                value = obj[ name ];

                this.session[ name ] = value;
            }
        }
    },

    /**
     * 删除session
     */
    destroy: function(){

        Session.delSession( this.id );
        delete this.session;
        delete this.id;
    }
};

module.exports = Session;