const  _ = require('./lodashSQL.js');

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

const configSelect = new Map();
configSelect.set('memberID', {dstName: 'mem_Id', defValue:null});
configSelect.set('teaId', {dstName: 'teacher_Id', defValue:null});
configSelect.set('RatingCW', {dstName: 'rt_Cw', defValue:0});
configSelect.set('ratingWW', {dstName: 'rt_Ww', defValue:0});
configSelect.set('incoCW', {dstName: 'inco_Cw', defValue:0});
configSelect.set('incoWW', {dstName: 'inco_Ww', defValue:0});

console.log('testSelect...............');
console.log(_.chain(_.concat(arr11,arr12,arr13,arr14))
        .groupBy('memberID')
        .map(_.spread(_.merge))
        .selectImp(configSelect)
        .value());

//console.log();
//console.log('testGroup..........');
//const groupMap = new Map();
//groupMap.set('teacher_Id', [{aggreFunc: 'first'}]);
//groupMap.set('rt_Cw', [{dstName: 'rt_Cw_sum', aggreFunc: 'sum'},
//        {dstName: 'rt_Cw_avg', aggreFunc: 'avg'}]);
//console.log(_.chain(_.concat(arr11,arr12,arr13,arr14))
//        .groupBy('memberID')
//        .map(_.spread(_.merge))
//        .selectImp(configSelect)
//        .groupImp('teacher_Id', groupMap)
//        .value());
//
//console.log();
//console.log('testInnerJoin..........');
//leftMap = new Map();
//leftMap.set('teaId', 'teacher_Id');
//rightMap = new Map();
//rightMap.set('teaId', 'teacherId');
//rightMap.set('ratingWW', 'myRtWW');
//console.log(_.chain(arr11).compact().innerJoinImp('teaId',arr12,'teaId',null,rightMap).compact().value());
