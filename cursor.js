export class Cursor{
	constructor({ phasedMiddleware, pipelineName, state, inputs, output}){
		// working state
		this.inputs= inputs
		this.state= state
		this.output= null
		// manipulator
		this.setOutput= this.setOutput.bind( this)

		// global context of run
		this.phasedMiddleware= phasedMiddleware
		this.pipelineName= pipelineName
		if( !this.phasedRun){
			throw new Error(`Phased run '${pipelineName}' not found`)
		}

		// positional context
		this.position= -1
		this.middleware= null

		// iterator protocol
		this.done= false
		this.value= this // cyclic
	}
	setOutput( output){
		const oldOutput= this.output
		this.output= output
		return oldOutput
	}
	next(){
		const position= ++this.position
		this.middleware= this.phasedRun[ position]
		this.done= this.position>= this.phasedRun.length
		if( this.done){
		}
		return this
	}
	get handler(){
		return this.middleware.handler
	}
	get plugin(){
		return this.phasedMiddleware[ this.symbol]
	}
	get phase(){
		return this.middleware.phase
	}
	get phasedRun(){
		return this.phasedMiddleware[ this.pipelineName]
	}
	get symbol(){
		return this.middleware.symbol
	}
	[Symbol.iterator](){
		return this
	}

	//// data accessing ////

	/**
	* ideal agnostic get that drills down through available state/contexts
	*/
	get( prop, def){
		const
		  handler= this.handler[ prop], // handler instance
		  hasHandler= handler!== undefined,
		  value= hasHandler? handler: this.phasedMiddleware[ prop] // pm instance
		if( value=== undefined&& def!== undefined){
			if( this.plugin.constructor.singleton){
				this.phasedMiddleware[ prop]= def
			}else{
				this.plugin[ prop]= def
			}
			return def
		}
		return value
	}
}
export default Cursor
