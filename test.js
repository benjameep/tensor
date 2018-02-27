var Tensor = require('./tensor.js')

var tensor = new Tensor({
    color:['red','blue','yellow'],
    shape:['circle','square','triangle'],
})
console.log(tensor.getSlice({
    shape:['circle'],
    // color:['red']
}).set(4))

console.log(tensor.valueOf())