const _ = require('lodash');
const csql = require('./collectionSQL.js');

const innerJoinImp = csql.innerJoinImp;
const selectImp = csql.selectImp;
const groupImp = csql.groupImp;

const source = {innerJoinImp,selectImp,groupImp};
_.mixin(source);

module.exports = _;
