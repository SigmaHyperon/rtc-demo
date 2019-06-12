const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const fn = (func) => {
    function papply(fn, ...args){
        const [first, ...rest] = args;
        return (typeof fn == 'function' && typeof first != 'undefined') ? papply(fn(first), ...rest) : fn;
    }
    return (...args) => papply(func, ...args);
}
module.exports = {pipe, fn};