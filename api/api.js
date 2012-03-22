/**
 * 数据接口模块
 */

var Session = require( '../session' );
var Auth = require( '../auth' );

(function(){

    var apiConfig = require( './config' );
    var callbackName = apiConfig[ 'cbName' ];
    var _ = require( 'underscore' );

    var API = {

        /**
         * 根据请求中是否含有指定的回调字段，来决定是否使用jsonp方式来返回
         * @param req
         * @param res
         * @param resData{
         *      result:
         *      type:
         *      data:
         *      error:
         * }
         */
        send: function( req, res, resData ){

            var callback = req.query[ callbackName ];
            var data = this.buildApiData( req, resData.result, resData.type, resData.data, resData.error );

            // 添加session数据
            this.attachSessionData( req, res, data );

            if( callback ){

                this.jsonp( callback, res, data );
            }
            else {

                this.json( res, data );
            }
        },

        /**
         * jsonp形式返回
         * @param callback
         * @param res
         * @param data
         */
        jsonp: function( callback, res, data ){

            res.send( callback + '(' + JSON.stringify( data ) + ');' );
        },

        /**
         * 返回json数据
         * @param res
         * @param data
         */
        json: function( res, data ){

            res.send( data );
        },

        /**
         * 构造标准的api格式数据
         * @param result
         * @param type
         * @param data
         * @param error
         */
        buildApiData: function( req, result, type, data, error ){

            var commonRes = apiConfig.commonRes;

            var resData = _.defaults( {}, commonRes );
            var auth = new Auth();

            resData.result = result;
            resData.type = type;
            resData.data = data;
            resData.error = error;

            // 附加login参数，用来表明该请求收到时是否已经登陆（而不是在向浏览器响应时是否登陆）
            resData.login = auth.ifLogin( req );

            return resData;
        },

        // 附加session信息返回（ID）
        attachSessionData: function( req, res, data ){

            var instance = req.STSession;
            data[ Session.fieldId ] = instance.id;
            data[ Session.resFieldId ] = res.RESSession;
        }
    };
    
module.exports = API;

})();