const _ = require('lodash');

const AggType = {
  max: 'max',
  min: 'min',
  fst: 'first',
  sum: 'sum',
  avg: 'avg',
  count: 'count',
  cdist: 'countDistinct',
};

class aggreWarp {

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

//根据配置的输出config生成数据
//结合lodash的map实现类似SQL对表的SELECT，同时提供默认值
// config配置：Map(key:srcName, value {dstName, defValue})
const selectImp = function(inputArr, config ,filter = null) {
  let result = [];
  for (let input of inputArr) {
      if (filter != null) {
        if (!filter(input)) {
            continue;
        }
      }
      let tmp= {};
      let inputMap = new Map();
      for (let attrName in input) {
          inputMap.set(attrName, input[attrName]);
      }
      for (let [field, fconfig] of config) {
          let value = inputMap.get(field);
          if (_.isUndefined(value)) {
              value = fconfig.defValue;
          }
          if (_.isUndefined(fconfig.dstName)) {
              tmp[field] = value;
          } else {
              tmp[fconfig.dstName] = value;
          }
      }
      result.push(tmp);
  }
  return result;
};

//集合的上卷聚集，结合lodash的group实现类似SQL的GROUP聚合计算功能
//configMap的配置:Map(key:srcName, value:[{dstName, aggreFunc}])
//configMap.set('teacherId', [{dstName: 'tc_range', aggreFunc: 'count'},
//{dstName: 'tc_count', aggreFunc: 'countDistinct'}]);
const groupImp = function(inputArr,groupKey, configMap) {
  const result = [];
  const groupObj = _.groupBy(inputArr, groupKey);
  for ( let key in groupObj) {
      let tmp = {};
      let paramArrMap = new Map();
      let groupArr = groupObj[key];
      for (let element of groupArr) {
          //对象的每个属性
          for (let key in element) {
              if (_.isUndefined(paramArrMap.get(key))) {
                  let arr = [];
                  arr.push(element[key]);
                  paramArrMap.set(key, arr);
              } else {
                  paramArrMap.get(key).push(element[key]);
              }
          }
      }
      for (let [field, configArr] of configMap) {
          let valueArr = paramArrMap.get(field);
          if (_.isUndefined(valueArr)) {
              continue;
          }
          for (let config of configArr) {
              if (_.isUndefined(config.dstName)) {
                  tmp[field] = aggreWarp[config.aggreFunc](valueArr);
              } else {
                  tmp[config.dstName] = aggreWarp[config.aggreFunc](valueArr);
              }
          }
      }
      result.push(tmp);
  }
  return result;
};


//类似SQL的innerjoin函数，目前只能应用在join值相等且能比较大小的情况下
//merge的时候两个集合同名字段会有一个被覆盖，如有需要保留请使用不同名字
//平均时间复杂度为:Log2(M) + Log2(N) + (M + N)/2 = O(M+N)
// configMap配置：Map(key:srcName, value:dstName)
// configMap.set('teaId', 'teacher_Id');
//TODO: leftJoin,rightJoin,outerJoin
//TODO:hashJoin
const innerJoinImp = (left, leftJoinAttr,  right
        ,rightJoinAttr, leftConfigMap=null, rightConfigMap=null) => {
  const result = [];
  if (left.length < 1 || right.length < 1) {
    return result;
  }
  let leftArr = _.sortBy(left, leftJoinAttr);
  let rightArr = _.sortBy(right, rightJoinAttr);
  let sr;
  let index = 0;
  let code;
  let tmpArr = [];
  let searchEnd = false;
  let lastV = undefined;
  for (let lv of leftArr) {
    if (lv[leftJoinAttr] == lastV) {
        for (let value of tmpArr) {
            result.push(joinCombine(lv, leftConfigMap, value, rightConfigMap));
        }
    } else if (searchEnd) {
        break;
    } else {
      tmpArr = [];
      lastV = lv[leftJoinAttr];
      while (true) {
        sr = findIndexInOrdered(rightArr,
        rightJoinAttr, lv[leftJoinAttr], index);
        code = sr.code;
        if (code == -2) {
          searchEnd = true;
          break;
        } else if (code == -1) {
          index = sr.index;
          break;
        }else if (code == 1) {
          index = sr.index;
          result.push(joinCombine(lv, leftConfigMap, rightArr[index]
            , rightConfigMap));
          tmpArr.push(rightArr[index]);
          index += 1;
          if (index == rightArr.length -1) {
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
        return {code: -2, index: null};
    }
    let i = fromIndex;
    while (i < max) {
        if (array[i][attName] == value) {
            return {code: 1, index: i};
        } else if (array[i][attName] > value) {
            return {code: -1, index: i};
        }
        i++;
    }
    return {code: -2, index: null};
};

//根据输出参数配置将两个对象合并并输出
const joinCombine = (lv, leftConfigMap, rv, rightConfigMap) => {
  if (leftConfigMap == null && rightConfigMap == null) {
    return _.merge(_.cloneDeep(lv), rv);
  }
  let result = {};
  ObjReflect(result, lv, leftConfigMap);
  ObjReflect(result, rv, rightConfigMap);
  return result;
};

//根据输入的参数配置对象字段映射
const ObjReflect = (outputObj, inputObj, configMap) => {
  if (configMap == null) {
    for (let key in inputObj) {
      outputObj[key] = inputObj[key];
    }
  } else {
    for (let [srcName,dstName] of configMap) {
      let tmp = inputObj[srcName];
      if (!_.isUndefined(tmp)) {
        if (_.isUndefined(dstName)) {
          outputObj[srcName] = tmp;
        } else {
          outputObj[dstName] = tmp;
        }
      }
    }
  }
};

module.exports.AggType = AggType;
module.exports.innerJoinImp = innerJoinImp;
module.exports.selectImp = selectImp;
module.exports.groupImp = groupImp;
