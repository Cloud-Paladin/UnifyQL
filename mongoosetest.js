function isArgumentsObject() {
        return (typeof arguments[0] == object);
}

let utils = {};
utils.isArgumentsObject = isArgumentsObject;
utils.isObject = isArgumentsObject;

//query的select函数

function select() {
    var arg = arguments[0];
    if (!arg) return this;

    if (arguments.length !== 1) {
        throw new Error("Invalid select: select only takes 1 argument");
    }

    //this._validate('select');

    var fields = this._fields || (this._fields = {});
    var type = typeof arg;

    if (('string' == type || utils.isArgumentsObject(arg)) &&
        'number' == typeof arg.length || Array.isArray(arg)) {
        if ('string' == type)
            arg = arg.split(/\s+/);

        for (var i = 0, len = arg.length; i < len; ++i) {
            var field = arg[i];
            if (!field) continue;
            var include = '-' == field[0] ? 0 : 1;
            if (include === 0) field = field.substring(1);
            fields[field] = include;
        }

        return this;
    }

    if (utils.isObject(arg)) {
        var keys = utils.keys(arg);
        for (var i = 0; i < keys.length; ++i) {
            fields[keys[i]] = arg[keys[i]];
        }
        return this;
    }

    throw new TypeError('Invalid select() argument. Must be string or object.');
}
//select({a :1, b: 1});

//TODO: aggregate的$project函数
project = function(arg) {
    var fields = {};

    if (typeof arg === 'object' && !util.isArray(arg)) {
        Object.keys(arg).forEach(function(field) {
            fields[field] = arg[field];
        });
    } else if (arguments.length === 1 && typeof arg === 'string') {
        arg.split(/\s+/).forEach(function(field) {
            if (!field) {
                return;
            }
            var include = field[0] === '-' ? 0 : 1;
            if (include === 0) {
                field = field.substring(1);
            }
            fields[field] = include;
        });
    } else {
        throw new Error('Invalid project() argument. Must be string or object');
    }

    return this.append({$project: fields});
};




