var Tensor = require('./tensor.js')

var tensor = new Tensor({
    color:['red','blue','yellow'],
    shape:['circle','square','triangle'],
    size:['small','medium','large']
})

// console.log(tensor.getSlice('shape').getSlice('size:small'))

for(var sub of tensor){
    console.log(sub)
}