const _ = require('lodash');
const csql = require('./collecSQL.js');

const innerJoinImp = csql.innerJoinImp;
const selectImp = csql.selectImp;
const groupImp = csql.groupImp;

const source = {innerJoinImp,selectImp,groupImp};
_.mixin(source);
_.AggType = csql.AggType;

module.exports = _;
