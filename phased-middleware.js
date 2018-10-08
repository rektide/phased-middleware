import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import Iterator from "./iterator.js"
import findPhases from "./util/find-phases.js"

function _makePipeline( pipelineName){
	const
	  name= `PhasedMiddleware:${this.name?this.name+":": ""}${pipelineName}:pipeline`,
	  wrapper= {
		[ name]: input=> new Iterator(this, pipelineName, input)
	  }
	return wrapper[ name]
}

// TODO: use field name in _phases when gathering
function _phases( middleware){
	const phases= {}
	for( const desc of getAllDescriptors( middleware)){
		const
		  name= desc.name|| desc.symbol,
		  member= middleware[ name]
		let
		  phase= member&& member.phase
		if( !phase){
			continue
		}

		// pluralize
		if( !phase[Symbol.iterator]){
			phase= [ phase]
		}
		for( let install of phase){
			let
			  pipeline= phases[ install.pipeline],
			  destPhase

			if( !pipeline){
				pipeline= phases[ install.pipeline]= {[ install.phase]: [ member]}
			}else if( destPhase= pipeline[ install.phase]){
				 destPhase.push( member)
			}else{
				pipeline[ install.phase]= [ member]
			}
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
			const changed= value!= value
			value= newValue
			if( changed){
				if( refreshPipelines){
					this._pipeline= null
					this._phaseNames= null
				}
				this.refresh()
			}
		},
		enumerable
	}
}

let nameSerial= 0
function _middlewareName( middleware){
	if( middleware.name){
		return middleware.name
	}
	if( middleware.constructor){
		return middleware.constructor.name
	}
	return `middleware-${nameSerial++}`
}

function _defaultName(){
	return `phased-${nameSerial++}`
}

export class PhasedMiddleware{
	constructor({ pipelines, middlewares, name}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
		Object.defineProperties( this, {
			name: _prop( name|| _defaultName(), true), // decorative
			// input data
			pipelines: _prop( pipelines|| {}, true, true), // the definition of our pipelines
			middlewares: _prop( middlewares|| [], true), // middlwares, in order they are installed in
			// generated
			pipeline: _prop( {}, true), // main execution point, runner of pipelines
			_pipeline: _prop( null), // pre-aggregated pipeline->phase->element-list
			_phaseNames: _prop( null), // pre-fetches pipeline->phases-list
			_refreshing: {
				value: false,
				writable: true
			}
		})
		this.refresh()
	}
	install( ...middlewares){
		this.middlewares.push( ...middlewares)
		this.refresh()
		return this
	}
	splice( index, remove, ...inserted){
		this.middlewares.splice( index, remove, inserted)
		this.refresh()
		return this
	}
	replace( ...middlewares){
		this.middlewares= middlewares
		this.refresh()
		return this
	}
	refresh(){
		if( this._refreshing){
			return
		}
		this._refreshing= true
		this._pipeline= {}
		if( !this._pipeline|| !this._phaseNames){
			this._phaseNames= {}
			for( let name in this.pipelines){
				this._phaseNames[ name]= Object.values( this.pipelines[ name])
				this.pipeline[ name]= this.pipeline[ name]|| _makePipeline.call( this, name)
			}
		}
		// iterate in order through middlewares
		for( const n in this.middlewares){
			const
			  middleware= this.middlewares[ n],
			  middlewareName= _middlewareName( middleware),
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
				for( const phaseName in midPipeline){ // go through each phase in the pipeline

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

					const symbol= Symbol.for(`${this.name}:${middlewareName}:${n}`)
					if( Array.isArray( midPhase)){
						for( const method of midPhase){
							preElements.push({ method, middleware, n, phasedMiddleware: this, symbol })
						}
					}else{
						preElements.push({ method: midPhase, middleware, n, phasedMiddleware: this, symbol })
					}
				}
			}
		}
		this._refreshing= false
	}
}
export default PhasedMiddleware
