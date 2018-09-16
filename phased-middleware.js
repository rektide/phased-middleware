import Namer from "./namer.js"

function _makePipeline(name){
	// wrapper is a hack to dynamically the function we're creating
	const 
	  wrapper= {
		[ name]: function( target){
			for( const middleware in this.middlewares){
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

const prop(default, enumerable= false){
	const value
	return {
		get: function(){
			return value
		},
		set: function( newValue){
			value = newValue
			this.refresh()
		},
		enumerable
	}
}

class PhasedMiddleware{
	constructor({ pipelines, namer, middlewares}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
		Object.defineProperties( this, {
			// input data
			pipelines: prop( pipelines|| {}, true), // the definition of our pipelines
			middlewares: prop( middlewares|| [], true), // middlwares, in order they are installed in
			namer: prop( namer|| new Namer(), true), // convert middleware to univque symbol name
			// generated
			pipeline: prop( {}, true), // main execution point, runner of pipelines
			symbols: prop([]), // the corresponding symbols generated for each installed middleware
			pregenerated: prop({}) // indexed pipeline->phase->methods
		})
		this.refresh()
	}
	install( middleware){
		this.middlewares.push( middleware)
		this.symbols.push( this.namer( middleware))
		this.refresh()
		return this
	}
	splice( index, remove, ...inserted){
		this.middlewares.splice( index, remove, inserted)
		const symbols= inserted.map( this.namer)
		this.symbols.splice( index, remove, symbols)
		this.refresh()
		return this
	}

	refresh(){
		this.pregenerated= {}
		for( let name in this.pipelines){
			this.pregenerated[ name]= []
		}
		for( const middleware of this.middlewares){ // iterate in order through middlewares
			const midPhases= middleware.phases|| _phases( middleware)

			// go through each pipeline
			for( const pipeline in this.pipelines){

				const midPipeline= midPhases[ pipeline]
				if( !midPipeline){
					// middleware doesn't have this pipeline, skip
					continue
				}

				// middlware has this pipeline, so get the pipeline from pregenerated
				let prePipeline= this.pregenerated[ pipeline]
				if( !prePipeline){
					prePipeline= this.pregenerated[ pipeline]= {}
				}

				// go through each phase in pipeline
				for( const phaseName of pipeline){ // go through each phase in the pipeline

					const midPhase= midPipeline[ phaseName]
					if( !midPhase){
						// middleware pipeline doesn't have this phase, skip
						continue
					}

					// middleware pipeline has this phase,  so add it to pregenerated pipeline
					let preMethods= prePipeline[ phaseName] // pregenerated methods for this phase
					const arr= Array.isArray( midPhase)
					if( preMethods){
						if( arr){
							preMethods.push( ...arr)
						}else{
							preMethods.push( arr)
						}
					}else{
						if( arr){
							prePipeline[ phaseName]= [ ...midPhase]
						}else{
							prePipeline[ phaseNAme]= [ midPhase]
						}
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
