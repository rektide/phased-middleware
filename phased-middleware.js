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
		  phaseNames: this._phaseNames[ pipelineName],
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

function _prop(value, enumerable= false, refreshPipelines){
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

export class PhasedMiddleware{
	constructor({ pipelines, middlewares}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
		Object.defineProperties( this, {
			// input data
			pipelines: _prop( pipelines|| {}, true, true), // the definition of our pipelines
			middlewares: _prop( middlewares|| [], true), // middlwares, in order they are installed in
			// generated
			pipeline: _prop( {}, true), // main execution point, runner of pipelines
			_pipeline: _prop( null), // pre-aggregated pipeline->phase->element-list
			_phaseNames: _prop( null) // pre-fetches pipeline->phases-list
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
export default PhasedMiddleware
