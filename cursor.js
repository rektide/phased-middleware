import Scope from "./scope.js"

export class Cursor{
	constructor({ phasedMiddleware, pipelineName, state, inputs, output, symbols}){
		// working state
		this.inputs= inputs
		this.state= state
		this.output= null
		this.symbols= symbols
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
	get i(){
		return this.middleware.i
	}
	get plugin(){
		return this.phasedMiddleware.plugins[ this.i]
	}
	get pluginData(){ // local data to this instance of the middleware
		return this.phasedMiddleware[ this.symbol]
	}
	set pluginData( value){
		this.phasedMiddleware[ this.symbol]= value
	}
	get phase(){
		return this.middleware.phase
	}
	get phasedRun(){
		return this.phasedMiddleware[ this.pipelineName]
	}
	get symbol(){
		return this.symbols[ this.i]
	}
	[Symbol.iterator](){
		return this
	}

	//// data accessing ////

	/**
	* ideal agnostic get that drills down through available state/contexts
	*/
	get( prop, opts, { defaultFn, def, scope, set}){
		// `set` happens at specified scope, immediately, if item not found there
		if( set){
			const
			  scopeName= scope|| this.get( $scope)|| "plugin",
			  scope_= Scope[ scopeName],
			  value= scope_.get( value)
			if( value=== undefined){
				scope_.set( value)
				return value
			}
			return value
		}

		// search for prop in DefaultScopes
		for( let i= 0; i< DefaultScopes.length; ++i){
			const
			  value= DefaultScopes[ i]( prop),
			  hasValue= value!== undefined
			if( hasValue){
				return value
			}
		}

		// `default`
		if( defaultFn!== undefined){
			def= defaultFn.call( this, prop, { scope})
		}
		if( def=== undefined){
			return
		}
		const
		  scopeName= scope|| this.get( $scope)|| "plugin",
		  scopeFn= Scope[ scopeName]
		scopeFn.call( this, prop, { set: def})
		return def
	}
}
export default Cursor
