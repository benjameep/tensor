const Tensor = function(dimensions){
    let sum = 1
    this.dims = Object.keys(dimensions).map(k => {
        let d = {
            value:k,
            keys: dimensions[k],
            size: sum
        }
        sum *= dimensions[k].length
        return d
    })
    this.data = Array(sum)
    this.slice = {}
}
Tensor.prototype.getSlice = function(slice){
    var copy = Object.assign(Object.create(Tensor.prototype),this)
    copy.slice = slice
    return copy
}
Tensor.prototype.getDist = function(position){
    return this.dims.reduce((sum,dim,i) => sum += dim.size * dim.keys.indexOf(position[i]),0)
}
Tensor.prototype.valueOf = function(){
    function loop(level,position){
        level = level || 0
        position = position || []
        if(level >= this.dims.length){
            return this.data[this.getDist(position)]
        } else {
            var dim = this.dims[level]
            var keys = this.slice[dim.value] || dim.keys
            var output = keys.reduce((obj,key) => {
                position[level] = key
                obj[key] = loop.call(this,level+1,position)
                return obj
            },{})
            var outputKeys = Object.keys(output)
            return outputKeys.length == 1 ? output[outputKeys[0]] : output
        }
    }

    return loop.call(this)
}
Tensor.prototype.set = function(value){
    var position = this.dims.map(dim => this.slice[dim.value][0])
    if(!position.every(n => n))
        throw 'Not accurate enough to set'
    return this.data[this.getDist(position)] = value
}

const tensorInstanceHandler = {
    get(target,prop){
        // console.log(typeof prop,prop)
        return Reflect.get(...arguments)
    }
}

module.exports = new Proxy(Tensor,{
    construct(target,args){
        var newTensor = new target(...args)
        return new Proxy(newTensor,tensorInstanceHandler)
    }
})