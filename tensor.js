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
    pushSlice(slice,dimi){
        // CAUTION: slice may be undefined, but dimi is guarenteed
        // take out the old slice
        this.slices.splice(dimi,1)
        // push the new slice to the back
        this.slices.push(slice)
        // move the corresponding dim to the same spot
        this.dims.splice(this.slices.length-1,0,this.dims.splice(dimi,1)[0])
    }
    copy(){
        let copy = Object.assign(Object.create(Tensor.prototype),this)
        copy.slices = copy.slices.slice()
        return copy
    }
    getSlice(str){
        var copy = this.copy()
        var [slice,dimi] = this.parseSlice(str)
        copy.pushSlice(slice,dimi)
        return copy
    }
    computeIndex(position){
        return this.dims.reduce((sum,dim,i) => sum += dim.size * position[i],0)
    }
    *[Symbol.iterator](){
        let dimi = this.slices.findIndex(slice => !slice || slice.length != 1)
        dimi = dimi == -1 ? this.slices.length : dimi

        for(let si = 0; si < (this.slices[dimi]||this.dims[dimi].values).length; si++){
            let vi = this.slices[dimi]?this.slices[dimi][si]:si
            let copy = this.copy()
            copy.pushSlice([vi],dimi)
            yield copy
        }
    }
    valueOf(){
        function loop(dimi,position){
            // If we are done
            if(dimi >= this.dims.length)
                return this.data[this.computeIndex(position)]
            
            // Else
            let structure = {}
            for(let si = 0; si < (this.slices[dimi]||this.dims[dimi].values).length; si++){
                position[dimi] = this.slices[dimi]?this.slices[dimi][si]:si
                // recurse
                structure[this.dims[dimi].values[position[dimi]]] = loop.call(this,dimi+1,position)
            }
            let structureKeys = Object.keys(structure)
            return structureKeys.length == 1 ? structure[structureKeys[0]] : structure
        }

        return loop.call(this,0,[])
    }
    set(value){
        // var position = this.dims.map(dim => this.slices.find(slice => slice.dim == dim))
        // if(!position.every(n => n))
        //     throw 'Not accurate enough to set'
        
        // // TODO: add check for only one value in each dimension
        // // TODO: Or somehow do multiple assignment
        // position = position.map(p => p.values[0])
        // return this.data[this.getDist(position)] = value
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