
const parse = require('node-sqlparser').parse;
const AST = require('node-sqlparser');
const stringify = require('node-sqlparser').stringify;
const alasql = require('./alasql');

let sql = `SELECT card, max(id) as maxId, count(area) as ct, sum(price) as total FROM productInfo 
     where price>10 and card in (1,3,5) and date between '2017-01-01' and '2017-06-05' 
     group by card order by total desc`;
let astObj = parse(sql);
console.log(astObj);
console.log();

alasql("CREATE TABLE  productInfo (id number, area number, price number,card number,date string)");
alasql("INSERT INTO productInfo VALUES (1, 10, 15, 1, '2017-08-01'),(2, 12, 18, 1, '2017-02-02'),(3, 11, 25, 3, '2017-03-01'),(4, 14, 25, 3, '2017-04-01')");
console.log(alasql(sql));

