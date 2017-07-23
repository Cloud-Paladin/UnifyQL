/**
 * Created by libing on 2017/7/22.
 */
const alasql = require('./alasql');

alasql("CREATE TABLE cities (city string, population number)");
alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
var res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
console.log(res);