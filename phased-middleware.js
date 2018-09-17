/**
 * Build a function that will return an iteratable/iterator of a given `pipelineName`
 */
function _makePipeline( pipelineName){
	// wrapper is a hack to dynamically the function we're creating
	const wrapper= {
	  [ name]: function( value){
		return {
		  // capture & hold some state from PhasedMiddleware
		  // middleware can copy & update these if they are feeling brave about dynamic pipeline reworking
		  pipeline: this._pipeline[ pipelineName],
		  phaseNames= this._phaseNames[ pipelineName],
		  // iteration stat
		  phase: 0, // current phase number in pipeline
		  element: 0, // current element number in phase
		  middleware: null, // the piece of middleware for the current element
		  // iterator/iterable methods
		  value, // current value
		  done: false, // whether we're done
		  next: function(){
			let
			  phaseName= this.phaseNames[ this.phase],
			  phase= this.pipeline[ phaseName]
			// advance phase until there is a valid element
			while( !phase|| this.element>= phase.length){
				this.phase++
				this.element= 0
				// check for end
				if( this.phase>= this.phaseNames.length){
					// overran end, therefore done
					this.value= undefined
					this.done= true
					return this
				}
				// load phase
				phaseName= this.phaseNames[ this.phase]
				phase= this.pipeline[ phaseName]
			}
			// get element, advance
			let element= phase[ this.element++]
			// capture element's middleware
			this.middleware= element.middleware
			// run, saving value
			this.value= element.method( this)
			// return current state of iterator
			return this
		  },
		  [Symbol.iterator]: function(){
			return this
		  }
		}
	  }
	}
	return wrapper[ name]
}

function _phases( middleware){
	const phases= {}
	for( const name of middleware){
		const
		  member= middleware[ name],
		  phase= member.phase
		if( !phase){
			continue
		}
		let phaseMethods= phases[ phase]
		if( phaseMethods){
			phaseMethods.push( member)
		}else{
			phases[ phase]= phaseMethods= [ member]
		}
	}
	return phases
}

const prop(default, enumerable= false, refreshPipelines){
	const value
	return {
		get: function(){
			return value
		},
		set: function( newValue){
			value = newValue
			if( refreshPipelines){
				this._pipeline= null
				this._phaseNames= null
			}
			this.refresh()
		},
		enumerable
	}
}

class PhasedMiddleware{
	constructor({ pipelines, middlewares}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
		Object.defineProperties( this, {
			// input data
			pipelines: prop( pipelines|| {}, true, true), // the definition of our pipelines
			middlewares: prop( middlewares|| [], true), // middlwares, in order they are installed in
			// generated
			pipeline: prop( {}, true), // main execution point, runner of pipelines
			_pipeline: prop( null), // pre-aggregated pipeline->phase->element-list
			_phaseNames: prop( null) // pre-fetches pipeline->phases-list
		})
		this.refresh()
	}
	install( middleware){
		this.middlewares.push( middleware)
		this.refresh()
		return this
	}
	splice( index, remove, ...inserted){
		this.middlewares.splice( index, remove, inserted)
		this.refresh()
		return this
	}
	refresh(){
		if( !this._pipeline|| !this._phaseNames){
			this._phaseNames= {}
			for( let name in this.pipelines){
				this._pipeline[ name]= {}
				this._phaseNames[ name]= Object.keys( this.pipelines[ name])
				this.pipeline[ name]= this.pipeline[ name]|| _makePipeline( name)
			}
		}
		this._pipeline= {}
		// iterate in order through middlewares
		for( const n in this.middlewares){
			const
			  middleware= this.middlewares[ n],
			  midPhases= middleware.phases|| _phases( middleware)

			// go through each pipeline
			for( const pipelineName in this.pipelines){

				// find what this middleware has for this pipelineNname
				const midPipeline= midPhases[ pipelineName]
				if( !midPipeline){
					// middleware doesn't have this pipeline, skip
					continue
				}

				// middlware has this pipeline, so get the _pipeline we'll be adding to
				let prePipeline= this._pipeline[ pipelineName]
				if( !prePipeline){
					prePipeline= this._pipeline[ pipelineName]= {}
				}

				// go through each phase in pipeline
				for( const phaseName of pipeline){ // go through each phase in the pipeline

					let midPhase= midPipeline[ phaseName]
					if( !midPhase){
						// middleware pipeline doesn't have this phase, skip
						continue
					}

					// middleware pipeline has this phase, so add it's elements to pregenerated _pipeline
					let preElements= prePipeline[ phaseName]
					if( !preElements){
						preElements= prePipeline[ phaseName]= []
					}

					if( Array.isArray( midPhase)){
						for( const method of midPhase){
							preElements.push({ method, middleware, n, phasedMiddleware: this })
						}
					}else{
						preElements.push( midPhase)
					}
				}
			}
		}
	}
}


// symbols for each `step` of the chain:
export const
  /**
  * property symbol for a handler function for this step in the chain
  */
  stepHandlerSymbol= Symbol("stepHandler"),
  /**
  * property symbol for a unique symbol for this step in the chain, used to store the chain step's state.
  */
  stepStateSymbol= Symbol("stepState")
// iterator symbols:
export const
  /**
  * The chain being iterated on.
  */
  chainSymbol= Symbol("chainSymbol"),
  /**
  * The phase number of the iterator.
  */
  phaseNumSymbol= Symbol("phaseNum"),
  /**
  * Derived from phaseNumSymbol, phaseNameSymbol holds the textual name of the current phase
  */
  phaseNameSymbol= Symbol("phaseNamesymbol"),
  /**
  * Derived from phaseNumSymbol, phaseStepsSymbol holds the collection of the current phases's steps
  */
  phaseStepsSymbol= Symbol("phaseSteps"),
  /**
  * Which step in the current phase the iterator is on.
  */
  stepNumSymbol= Symbol("stepNum"),
  /**
  * The current step is also stored on the iterator? Why?
  */
  stepSymbol= Symbol("step"),
// exec symbols:
const
  stepStateSymbolSymbol= Symbol("stepStateSymbolSymbol")

/**
* Helper for steps to get their state with
*/
export function stepState( exec){
	// find the step's plugin state symbol & retrieve symbol from the prox
	const
	  stepStateSymbol= exec[ stepStateSymbolSymbol],
	  state= exec.prox[ stepStateSymbol]
	return state
}

/**
* @this - a command-chain `exec`
*/
export function chainEval( step){
	// save the step's unique symbol
	this[ stepStateSymbolSymbol]= step[ stepStateSymbol]

	// many plugins could well not need state passed to them, so don't waste the lookup: call stepState helper if needed.
	// this[ stepStateSymbol]= this.prox[ this[ stepStateSymbolSymbol]]

	// Originally I'd intended to .call() with the stepState but:
	// a. i'm happy passing via `.symbol` so this is semi-redundant
	// b. i'm a little nervous .call() will have some minor performance impacts
	// c. i don't want to block someone who wants to .bind() their handler in some creative manner! for now i leave the use of `this` free.
	//return step[ stepHandlerSymbol].call( this.symbol, this)

	// get the handler of this step & call it
	return step[ stepHandlerSymbol]( this)
}

export class PhasedMiddlewarePipeline extends Array{
	static get phases(){
		return phases
	}
	static set phases(v){
		phases.splice( 0, phases.length, ...v)
	}
	static get stepHandlerSymbol(){
		return stepHandlerSymbol
	}
	static get stepStateSymbol(){
		return stepStateSymbol
	}
	static get chainEval(){
		return chainEval
	}
	/**
	* An iterator's `phaseNameSymbol` and `phaseStepsSymbol` are derived from `phaseNumSymbol. Recalculate them.
	*/
	static recalcIterator( iter){
		const
		  phaseNum= iter[ phaseNumSymbol],
		  phaseName= iter[ phaseNameSymbol]= phases[ phaseNum],
		  chain= iter[ chainSymbol]
		iter[ phaseStepsSymbol]= chain[ phaseName]
	}
	constructor(){
		super()
	}
	/**
	* Create an iterator for the Chain, which will use `phaseNumSymbol` and `stepNumSymbol` to iterate through each phase, and each step in each phase.
	*/
	[Symbol.iterator](){
		const initPhaseName= phases[ 0]
		return {
			[chainSymbol]: this,
			[phaseNumSymbol]: 0,
			[phaseNameSymbol]: initPhaseName,
			[phaseStepsSymbol]: this[ initPhaseName],
			[stepNumSymbol]: 0,
			/**
			* @this - exec
			*/
			next: function(){
				let
				  phaseSteps= this[ phaseStepsSymbol],
				  stepNum= this[ stepNumSymbol]++,
				  step= this[ stepSymbol]= phaseSteps&& phaseSteps[ stepNum]
				while( !step){ // advance to next phase
					let phaseNum= ++this[ phaseNumSymbol]
					if( phaseNum> phases.length){
						return {
							done: true
						}
					}
					const phaseName= this[ phaseNameSymbol]= phases[ phaseNum]
					phaseSteps= this[ phaseStepsSymbol]= this[ chainSymbol][ phaseName]
					this[ stepNumSymbol]= 1 // increment past step 0, which we're doing now
					step= this[ stepSymbol]= phaseSteps&& phaseSteps[ 0]
				}
				return {
					value: step,
					done: false
				}
			}
		}
	}
	install( handler, symbol, phase){
		// find phase
		if( !handler){
			return
		}
		if( phase=== undefined){
			// handler can specify phase or default to "run"
			phase= handler.phase|| "run"
		}
		// retrieve or create the array of steps for this phase
		const steps= this[ phase]|| (this[ phase]= [])
		// add our new step
		steps.push({
			[stepHandlerSymbol]: handler, // the handler
			[stepStateSymbol]: symbol // the symbol to retrieve the handlers state with
		})
	}
	uninstall( handler, symbol, phase){
		// find phase
		if( !handler){
			return
		}
		if( phase=== undefined){
			phase= handler.phase|| "run"
		}
		const steps= this[ phase]
		if( !steps){
			return false
		}
		for( let i in steps){
			const step= steps[ i]
			if( step[ stepHandlerSymbol]=== handler&& (!symbol || step[ stepStateSymbol]=== symbol)){
				steps.splice( i, 1)
				return true
			}
		}
		return false
	}
}

export default PhasedMiddlewarePipeline
