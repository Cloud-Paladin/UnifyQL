const  _ = require('./lodashWrapper.js');

const arr11 = [
    { memberID : "81fs", teaId:1, RatingCW:4.5},
    { memberID : "82fs", teaId:1, RatingCW:5 },
    { memberID : "83fs", teaId:2, RatingCW:3},
    { memberID : "84fs", teaId:2, RatingCW:4.7}
];
const arr12 = [
    { memberID : "80fs", teaId:1, ratingWW: 4},
    { memberID : "81fs", teaId:1, ratingWW: 4.5},
    { memberID : "83fs", teaId:2, ratingWW: 3},
    { memberID : "82fs", teaId:1, ratingWW: 5},
];
const arr13 = [
    { memberID : "80fs", teaId:1, incoCW:4},
    { memberID : "81fs", teaId:1, incoCW:4.5},
    { memberID : "83fs", teaId:2, incoCW:3},
    { memberID : "84fs", teaId:2, incoCW:4.5}
];
const arr14 = [
    { memberID : "81fs", teaId:1, incoWW:2.5 },
    { memberID : "82fs", teaId:1, incoWW:5 },
    { memberID : "84fs", teaId:2, incoWW:6.5 }
];

const configTest = {
    memberID: 1,
    genId: {$literal: 1},
    teacher_Id: '$teaId',
    city: 'BeiJing',
    street: {$literal: 'ChangAnRoad'},
    memID: {$literal: '$memberID'},
    rt_Cw: {$defValue: ['$RatingCW', 0]},
    rt_Ww: {$defValue: ['$ratingWW', 0]},
    inco_Cw: {$defValue: ['$incoCW', 0]},
    inco_Ww: {$defValue: ['$incoWW', 0]},
    defValue: {$defValue: ['$incoWW', 0]},
    new_Id: {$concat: ['$memberID', '$teaId',1]},
    new_Id1: {$concat: ['Company', '$memberID', '$teaId']},
    new_Id2: {$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]},
    new_Id3: {$concat: [{$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]}, {$defValue: ['$incoCW', 0]}]},
    self_Id: v => v.memberID + v.teaId
};

const configTest1 = '-teaId -memberID';
const configTest2 = 'teaId memberID';

//console.log('testSelect...............');
//console.log(_.chain(_.concat(arr11,arr12,arr13,arr14))
//    .groupBy('memberID')
//    .map(_.spread(_.merge))
//    .selectImp(configTest)
//    .value());

const configJoinLeft =  null;
const configJoinRight = null;

const configJoinLeft1 = {
    memberID: 1,
    genId: {$literal: 1},
    teacher_Id: '$teaId',
    city: 'BeiJing',
    street: {$literal: 'ChangAnRoad'},
    memID: {$literal: '$memberID'},
    rt_Cw: {$defValue: ['$RatingCW', 0]},
    rt_Ww: {$defValue: ['$ratingWW', 0]},
    inco_Cw: {$defValue: ['$incoCW', 0]},
    inco_Ww: {$defValue: ['$incoWW', 0]},
    new_Id: {$concat: ['$memberID', '$teaId',1]},
    new_Id1: {$concat: ['Company', '$memberID', '$teaId']},
    new_Id2: {$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]},
    new_Id3: {$concat: [{$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]}, {$defValue: ['$incoCW', 0]}]},
    self_Id: v => v.memberID + v.teaId
};

const configJoinRight1 = {
    memberID: 1,
    teacher_Id: '$teaId',
    city: 'BeiJing',
    self_Id: v => v.memberID + v.teaId,
    genId: {$literal: 1},
    street: {$literal: 'ChangAnRoad'},
    memID: {$literal: '$memberID'},
    rt_Cw: {$defValue: ['$RatingCW', 0]},
    rt_Ww: {$defValue: ['$ratingWW', 0]},
    inco_Cw: {$defValue: ['$incoCW', 0]},
    inco_Ww: {$defValue: ['$incoWW', 0]},
    rnew_Id: {$concat: ['$memberID', '$teaId', 1]},
    rnew_Id1: {$concat: ['Company', '$memberID', '$teaId']},
    rnew_Id2: {$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]},
    rnew_Id3: {$concat: [{$concat: [{$literal: 'Company'}, {$concat: ['$memberID', '$teaId']}]}, {$defValue: ['$incoCW', 0]}]},
};

console.log();
console.log('testInnerJoin..........');
//console.log(_.chain(arr11).innerJoinImp('teaId',arr12,'teaId',null, null).value());
//console.log(_.chain(arr11).innerJoinImp('teaId',arr12,'teaId',configJoinLeft1,configJoinRight1).value());

let groupConfig = {
    //_groupBy: null, //全数据集group
    _groupBy: '$teaId', //针对某一字段group
    //_groupBy:  v => v.productId * v.count, //针对函数表达式group
    teaId: {$first: '$teaId'},
    count: {$sum: 1}, //常量聚集
    avgPrice: {$avg: '$incoWW'},//字段聚集
    totalPrice: {$sum: v => v.teaId * 2}, //函数表达式聚集
    comb: {$sum: {$multiply: [2, '$teaId']}} //嵌套表达式聚集
};
console.log(_.chain(arr11).concat(arr12,arr13,arr14)
    .groupBy('memberID')
    .map(_.spread(_.merge))
    .groupImp(groupConfig)
    .value());