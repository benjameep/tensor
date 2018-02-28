const util = require('util')


class Fibbonacci{
    constructor(length){
        this.length = length
    }
    *[Symbol.iterator](){
        let [curr,next] = [0,1],length = this.length, i = 0
        while(i++ < length){
            yield curr;
            [curr,next] = [next,curr+next];
        }
    }
    [util.inspect.custom](depth, options) {
        return Array.from(this)
    }
}
var meep = new Proxy(new Fibbonacci(10),{
    get(target,prop){
        console.log(prop)
        return Reflect.get(...arguments)
    }
})

var fib = new Fibbonacci(10)

// for(var i of fib){
//     console.log(i)
// }

console.log(fib)