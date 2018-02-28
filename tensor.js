class Tensor{
    constructor(dimensions){
        let sum = 1
        this.dims = Object.keys(dimensions).map((k,i) => {
            let d = {
                key:k,
                values: dimensions[k],
                size: sum
            }
            sum *= dimensions[k].length
            return d
        })
        this.data = Array(sum)
        this.slices = []
    }
    parseSlice(str){
        var [key,value] = str.split(':')
        var slice = value && value.split(',').filter(n => n)
        var dimi = this.dims.findIndex(dim => dim.key == key)

        if(dimi == -1) throw ReferenceError(`There is no "${slice.key}" dimension`)
        if(slice){
            // Turning all of the values into indexs
            slice = slice.map(value => {
                var index = this.dims[dimi].values.indexOf(value)
                if(index == -1)throw ReferenceError(`There is no ${value} value in the ${key} dimension`)
                return index
            })
        }

        return [slice,dimi]
    }
    pushSlice(str){
        // CAUTION: slice may be undefined, but dimi is guarenteed
        var [slice,dimi] = this.parseSlice(str)
        // take out the old slice
        this.slices.splice(dimi,1)
        // push the new slice to the back
        this.slices.push(slice)
        // move the corresponding dim to the same spot
        this.dims.splice(this.slices.length-1,0,this.dims.splice(dimi,1)[0])
    }
    copy(){
        return Object.assign(Object.create(Tensor.prototype),this)
    }
    getSlice(str){
        var copy = this.copy()
        copy.pushSlice(str)
        return copy
    }
    computeIndex(position){
        return this.dims.reduce((sum,dim,i) => sum += dim.size * position[i],0)
    }
    // *[Symbol.iterator](){
    //     this.slices.find(slice => slice.values.length > 1)
    //     yield
    // }
    oldValueOf(){
        // TODO: Figure out a faster way of doing this
        const levels = this.slices.concat(this.dims.filter(dim => !this.slices.find(slice => slice.dim == dim)))

        function loop(level,position){

            // TODO: rename these variables so that it is more readable
            level = level || 0
            position = position || []
            if(level >= levels.length){
                return this.data[this.computeIndex(position)]
            } else {
                var output = levels[level].values.reduce((obj,value) => {
                    position[(levels[level].dim||levels[level]).index] = value
                    obj[value] = loop.call(this,level+1,position)
                    return obj
                },{})

                var outputKeys = Object.keys(output)
                return outputKeys.length == 1 ? output[outputKeys[0]] : output
            }
        }

        return loop.call(this)
    }
    valueOf(){
        let position = []
        for(let dimi = 0; dimi < this.dims.length; dimi++){
            for(let si = 0; si < (this.slices[dimi]||this.dims[dimi].values).length; si++){
                position[dimi] = this.slices[dimi]?this.slices[dimi][si]:si
                console.log(position)
            }
        }
    }
    set(value){
        var position = this.dims.map(dim => this.slices.find(slice => slice.dim == dim))
        if(!position.every(n => n))
            throw 'Not accurate enough to set'
        
        // TODO: add check for only one value in each dimension
        // TODO: Or somehow do multiple assignment
        position = position.map(p => p.values[0])
        return this.data[this.getDist(position)] = value
    }
}

const tensorInstanceHandler = {
    get(target,prop,reciever){
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