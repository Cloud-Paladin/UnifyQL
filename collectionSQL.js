const _ = require('lodash');

const AggType = {
    max: '$max',
    min: '$min',
    fst: '$first',
    sum: '$sum',
    avg: '$avg',
    count: '$count',
    cdist: '$countDistinct',
};

class aggreWrap {

    static [AggType.rm](inputArr) {
        return null;
    };

    static [AggType.fst](inputArr) {
        return inputArr[0];
    };

    static [AggType.max](inputArr) {
        return _.max(inputArr);
    };

    static [AggType.min](inputArr) {
        return _.min(inputArr);
    };

    static [AggType.sum](inputArr) {
        return _.sum(inputArr);
    };

    static [AggType.avg](inputArr) {
        return _.mean(inputArr);
    };

    static [AggType.count](inputArr) {
        return inputArr.length;
    };

    static [AggType.cdist](inputArr) {
        return _.uniq(inputArr).length;
    };
};

const ExpreType = {
    literal: '$literal',
    defValue: '$defValue',
    concat: '$concat',
    multiply: '$multiply'
}

class ExpressionWrap {

    static [ExpreType.literal](input) {
        return input;
    }

    static [ExpreType.defValue](input, defv) {
        if (_.isUndefined(input)) {
            return defv;
        }
        return input;
    }

    static [ExpreType.concat](...input) {
        return ''.concat(...input);
    }

    static [ExpreType.multiply](...input) {
        let result = 1;
        for (let val of input) {
            result *= val;
        }
        return result;
    }
}

//配置解析
const selectConfResolve = function(config) {
    if (!config) {
        return [undefined, config, undefined];
    }
    let exclude = 0;
    let formatConfig = {};
    const confType = typeof config;
    if ('string' == confType) {
        config = config.split(/\s+/);
        for (let field of config) {
            if (!field) continue;
            let include = '-' == field[0] ? 0 : 1;
            if (include == 0) {
                field = field.substring(1);
            }
            formatConfig[field] = include;
        }
    } else if ('object' == confType) {
        formatConfig = config;
    }
    if (Object.keys(formatConfig)[0] == 0) {
        exclude = 1;
        let tmpConfig = {};
        for (let key in formatConfig) {
            if (formatConfig[key] == 0) {
                tmpConfig[key] = formatConfig[key];
            }
        }
        formatConfig = tmpConfig;
    }
    return [exclude, formatConfig, Object.keys(formatConfig)];
}

//字段排除映射
const selectExcludeMapper = function (configKeys, input) {
    let result = {};
    for (let key in input) {
        if (configKeys.indexOf(key) == -1) {
            result[key] = input[key];
        }
    }
    return result;
}

//字段选择映射
const selectMapper = function (config, input) {
    let result = {};
    for (let key in config) {
        let value = config[key];
        let type = typeof value;
        if ( 'number' ==  type) {
            if (value == 1) {
                result[key] = input[key];
            }
        } else if ('string' ==  type) {
            if (value[0] == '$') {
                result[key] = input[value.substring(1)];
            } else {
                result[key] = value;
            }
        } else if ('function' == type) {
            result[key] = value(input);
        } else if ('object' == type) {
            result[key] = expressionResolve(input, value);
        }
    }
    return result;
};

//根据输入的参数配置对象字段映射
const selectReflect = (input, config, configKeys, exclude) => {
    if (!config) {
        return input;
    }
    if (exclude) {
        return selectExcludeMapper(configKeys, input);
    } else {
        return selectMapper(config, input);
    }
};

//表达式解析
const expressionResolve = function(input, expObject) {
    for (let expName in expObject) {
        let param = expObject[expName];
        if (_.isArray(param)) {
            const genParam = [];
            for (let pv of param) {
                if ('object' == typeof pv) {
                    genParam.push(expressionResolve(input, pv));
                } else if ('string' == typeof pv && pv[0] == '$') {
                    genParam.push(input[pv.substring(1)]);
                } else {
                    genParam.push(pv);
                }
            }
            return ExpressionWrap[expName](...genParam);
        } else {
            if ('object' == typeof param) {
                return ExpressionWrap[expName](expressionResolve(input, param));
            } else if ('string' == typeof param && param[0] == '$' && expName != ExpreType.literal) {
                return ExpressionWrap[expName](input[param.substring(1)]);
            } else {
                return ExpressionWrap[expName](param);
            }
        }
        return null;
    }
};

//集合的select
const selectImp = function(inputArr, config ,whereCondition) {
    const result = [];
    if (!_.isArray(inputArr)) return null;
    if (!config) return inputArr;
    let [exclude, formatConfig, configKeys] = selectConfResolve(config);
    for (let input of inputArr) {
        if (!whereCondition && 'function' == typeof whereCondition) {
            if (!whereCondition(input)) {
                continue;
            }
        }
        result.push(selectReflect(input, formatConfig, configKeys, exclude));
    }
    return result;
};

//集合的Group聚集计算
const groupImp = function(inputArr, config) {
    const result = [];
    if (!_.isArray(inputArr) || inputArr.length == 0 || !config) {
        return result;
    }
    let groupKey = null;
    let configMap = new Map();
    for (let key in config) {
        if (key == '_groupBy') {
            groupKey = config[key];
            if ('string' == typeof groupKey) {
                if (groupKey[0] == '$') {
                    groupKey = groupKey.substring(1);
                } else {
                    groupKey = null;
                }
            }
        } else {
            configMap.set(key, config[key]);
        }
    }

    let groupObj;
    if (groupKey != null) {
        groupObj = _.groupBy(inputArr, groupKey);
    } else {
       groupObj = {nullKey: inputArr};
    }

    for (let key in groupObj) {
        let tmp = {};
        const valueMap = new Map();
        for (let mapKey of configMap.keys()) {
            valueMap.set(mapKey, []);
        }
        for (let input of groupObj[key]){
           for (let mapKey of configMap.keys()) {
              let aggObj = configMap.get(mapKey);
              let aggType = Object.keys(aggObj)[0];
              let aggValue =  aggObj[aggType];
              let type = typeof aggValue;
              let value;
              if ('string' == type && aggValue[0] == '$') {
                value = input[aggValue.substring(1)];
              } else if ('function' == type) {
                value = aggValue(input);
              } else if ('object' == type) {
                value = expressionResolve(input, aggValue);
              } else {
                value = aggValue;
              }
              if (value != null && value != undefined) {
                  valueMap.get(mapKey).push(value);
              }
           }
        }
        for (let mapKey of configMap.keys()) {
            let aggType = Object.keys(configMap.get(mapKey))[0];
            tmp[mapKey] = aggreWrap[aggType](valueMap.get(mapKey));
        }
        result.push(tmp);
    }
    return result;
};

//类似SQL的innerjoin函数，目前只能应用在join值相等且能比较大小的情况下
//merge的时候两个集合同名字段会有一个被覆盖，如有需要保留请使用不同名字
//平均时间复杂度为:Log2(M) + Log2(N) + (M + N)/2 = O(M+N)
//TODO: leftJoin,rightJoin,outerJoin
//TODO:hashJoin
const innerJoinImp = (left, leftJoinAttr,  right
    ,rightJoinAttr, leftConfig = null, rightConfig = null) => {
    const result = [];
    if (!_.isArray(left) || left.length == 0 || !leftJoinAttr ||
        !_.isArray(right) || right.length == 0 || !rightJoinAttr) {
        return result;
    }
    let [leftExclude, leftFormatConfig, leftConfigKeys] = selectConfResolve(leftConfig);
    let [rightExclude, rightFormatConfig, rightConfigKeys] = selectConfResolve(rightConfig);
    let leftArr = _.sortBy(left, leftJoinAttr);
    let rightArr = _.sortBy(right, rightJoinAttr);
    let index = 0;
    let code;
    let tmpArr = [];
    let searchEnd = false;
    let lastV = undefined;
    for (let lv of leftArr) {
        if (lv[leftJoinAttr] == lastV) {
            for (let value of tmpArr) {
                result.push(joinCombine(lv, leftConfig, leftConfigKeys,
                leftExclude, value, rightConfig, rightConfigKeys, rightExclude));
            }
        } else if (searchEnd) {
            break;
        } else {
            tmpArr = [];
            lastV = lv[leftJoinAttr];
            while (true) {
                [code, index] = findIndexInOrdered(rightArr,
                    rightJoinAttr, lv[leftJoinAttr], index);
                if (code == -2) {
                    searchEnd = true;
                    break;
                } else if (code == -1) {
                    break;
                }else if (code == 1) {
                    result.push(joinCombine(lv, leftConfig, leftConfigKeys,
                        leftExclude, rightArr[index], rightConfig,
                        rightConfigKeys, rightExclude));
                    tmpArr.push(rightArr[index]);
                    index += 1;
                    if (index >= rightArr.length) {
                        searchEnd = true;
                        break;
                    }
                }
            }
        }
    }
    return result;
};

/**
 * 从已经排好序的数组中找到匹配目标值的index
 *
 *@returns: 目标值在数组中的index，
 * code: 1:找到；-1:没有找到；-2：数组搜索完毕没有找到
 */
const findIndexInOrdered = (array, attName, value, fromIndex) => {
    const max = array.length;
    if (fromIndex >= max) {
        return [-2, max];
    }
    let i = fromIndex;
    while (i < max) {
        if (array[i][attName] == value) {
            return [1, i];
        } else if (array[i][attName] > value) {
            return [-1, i];
        }
        i++;
    }
    return [-2, max];
};

//根据输出参数配置将两个对象合并并输出
const joinCombine = (lv, leftConfig, leftConfigKeys, leftExclude,
    rv, rightConfig, rightConfigKeys, rightExclude) => {
    if (!leftConfig && !rightConfig) {
        return _.merge(_.cloneDeep(lv), rv);
    }
    let result = {};
    let lr = selectReflect(lv, leftConfig, leftConfigKeys, leftExclude);
    for (let key in lr) {
        result[key] = lr[key];
    }
    let rr = selectReflect(rv, rightConfig, rightConfigKeys, rightExclude);
    for (let key in rr) {
        result[key] = rr[key];
    }
    return result;
};


module.exports.AggType = AggType;
module.exports.innerJoinImp = innerJoinImp;
module.exports.selectImp = selectImp;
module.exports.groupImp = groupImp;
