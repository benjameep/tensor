var Tensor = require('./tensor.js')

var tensor = new Tensor({
    color:['red','blue','yellow'],
    shape:['circle','square','triangle'],
    size:['small','medium','large']
})
// console.log(tensor.getSlice('shape:circle').getSlice('color:blue').set(5))
// console.log(tensor.getSlice('shape').getSlice('color').valueOf())
console.log(tensor.getSlice('size').valueOf())
// console.log(tensor.getSlice('size').getSlice('size:large'))