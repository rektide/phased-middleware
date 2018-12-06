import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import Iterator from "./iterator.js"
import findPhases from "./util/find-phases.js"
import { $middlewares, $name, $pipelines } from "./symbol.js"

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
		this[ $middlwares]= middlewares|| []
		this[ $name]= name|| _defaultName()
		this[ $pipelines]= pipelines
		this.exec= {}
		this.pipeline= {}
		for( let [ pipelineName, phases] of Object.entries( pipelines)){
			const pipeline= new PhasedRun( phases)
			this.pipeline=  pipeline
			this.exec= _makeExec( pipeline, this)
		}
		if( middlewares){
			this.install( ...middlewares)
		}
	}
	install( ...middlewares){
		for( let middleware of middlewares){
			for( let descriptor of getAllDescriptors( middleware){
				const handler= middleware[ descriptor.name]
				let phases= handler.phase
				if( !phase){
					continue
				}
				if( !Array.isArray( phases)){
					phases= [ phases]
				}
				for( let item of phases){
					this.pipelines[ item.pipeline].install( item.phase, handler)
				}
			}
			const middlewarePhases= middleware[ $phases]|| middleware.phases|| {}
			for( let [ pipelineName, phases] in Object.entries( middlewarePhases)){
				for( let [ phaseName, handlers] of Object.entries( phases)){
					if( !Array.isArray( handlers)){
						handlers= [ handlers]
					}
					for( let handler of handlers){
						this.pipelines[ pipelineName].install( phaseName, handler)
					}
				}
			}
		}
	}
}
export default PhasedMiddleware
