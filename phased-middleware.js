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

let nameSerial= 0
function _middlewareName( middleware){
	if( middleware.name){
		return `${middleware.name}-${nameSerial++}`
	}
	if( middleware.constructor){
		return middleware.constructor.name
	}
	return `phased-middleware-${nameSerial++}`
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
			this[ pipelineName]= new PhasedRun( phases)
		}
		if( middlewares){
			this.install( ...middlewares)
		}
	}
	install( ...middlewares){
		for( let middleware of middlewares){
			// look for properties that have a `phase`
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
					this[ item.pipeline].install( item.phase, handler)
				}
			}
			// look at `phases` on the middleware
			const middlewarePhases= middleware[ $phases]|| middleware.phases|| {}
			for( let [ pipelineName, phases] in Object.entries( middlewarePhases)){
				for( let [ phaseName, handlers] of Object.entries( phases)){
					if( !Array.isArray( handlers)){
						handlers= [ handlers]
					}
					for( let handler of handlers){
						this[ pipelineName].install( phaseName, handler)
					}
				}
			}
		}
	}
}
export default PhasedMiddleware
