/**
 * 与接口相关的配置
 */

var Config = {

    cbName: 'callback',

    // 每个接口数据的返回约定格式
    commonRes: {
        result: undefined,      // 该请求操作是否成功
        error: undefined,       // 若失败的错误信息
        type: undefined,        // 请求类型
        data: undefined         // 额外数据
    }
};

module.exports = Config;