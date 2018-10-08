export class PhasedIterator{
	constructor( phasedMiddleware, pipelineName, input){
		Object.defineProperties( this, {
			// top level state describing this iterator
			phasedMiddleware: {
				value: phasedMiddleware,
				writable: true
			},
			input: {
				value: input,
				writable: true
			},
			pipelineName: {
				value: pipelineName,
				writable: true
			},

			// iteration state
	  		// current phase number in pipeline
			phaseNum: {
				value: 0,
				writable: true
			},
	  		// current element number in phase
			elementNum: {
				value: 0,
				writable: true
			},
	  		// the piece of middleware for the current element
			middleware: {
				value: null,
				writable: true
			},

			// bound methods
			setValue: {
				value: this.setValue.bind( this),
				writable: true
			}
		})
		this.value= phasedMiddleware.startWithInput? input: undefined
		this.done= false
	}
	get pipeline(){
		return this.phasedMiddleware._pipeline[ this.pipelineName]
	}
	get phaseNames(){
		return this.phasedMiddleware._phaseNames[ this.pipelineName]
	}
	get phaseName(){
		return this.phaseNames[ this.phaseNum]
	}
	get phase(){
		return this.pipeline&& this.pipeline[ this.phaseName]
	}
	setValue( value){
		this.value= value
	}

	exec(){
		for( let val of this){
		}
		return this.value
	}

	next(){
		if( this.done){
			return this
		}
		let
		  phaseName= this.phaseName,
		  phase= this.phase
		// advance phase until there is a valid element
		while( !this.phase|| this.elementNum>= phase.length){
			this.phaseNum++
			this.elementNum= 0
			// check for end
			if( this.phaseNum>= this.phaseNames.length){
				// overran end, therefore done
				this.value= undefined
				this.done= true
				return this
			}
			// load phase
			phaseName= this.phaseName
			phase= this.phase
		}
		// get element, advance
		let element= phase[ this.elementNum++]
		// capture element's middleware
		this.middleware= element.middleware
		// run, saving value
		const done= element.method( this)
		if( done){
			this.done= true
		}
		// return current state of iterator
		return this
	}
	[Symbol.iterator](){
		return this
	}
}
export default PhasedIterator

