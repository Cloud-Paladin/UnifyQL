/**
 * Created by libing on 2017/7/22.
 */

const parse = require('node-sqlparser').parse;
const AST = require('node-sqlparser');
const stringify = require('node-sqlparser').stringify;
const alasql = require('./alasql');

let sql = "SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC";
sql = 'SELECT id as proId, count(area) as ct, sum(price) as total FROM produceInfo ' +
    ' where price>10 group by id order by total desc';
let astObj = parse(sql);
console.log(astObj);
console.log();
alasql(sql);
//const ast = new AST();
//const ast.parse(sql);
//console.log(ast.stringify());
//let sqlstr = stringify(astObj);
//alasql("CREATE TABLE cities (city string, population number)");
//alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
//let res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
