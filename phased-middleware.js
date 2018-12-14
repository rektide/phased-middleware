import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import Iterator from "./iterator.js"
import { middlewareName, defaultName} from "./name.js"
import { $middlewares, $name, $phases, $pipelines, $symbols } from "./symbol.js"
import findPhases from "./util/find-phases.js"

function _makePipeline( pipelineName){
	const
	  name= `PhasedMiddleware:${this.name?this.name+":": ""}${pipelineName}:pipeline`,
	  wrapper= {
		[ name]: input=> new Iterator(this, pipelineName, input)
	  }
	return wrapper[ name]
}

export class PhasedMiddleware{
	constructor({ pipelines, middlewares, name}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
	
		// initialize base state
		this[ $middlewares]= middlewares|| []
		this[ $name]= name|| defaultName()
		this[ $pipelines]= pipelines
		this[ $symbols]= new WeakMap()

		// create each pipeline
		for( let [ pipelineName, phases] of Object.entries( pipelines)){
			this[ pipelineName]= new PhasedRun( phases)
		}

		// install middlewares into pipelines
		if( middlewares){
			this.install( ...middlewares)
		}
	}
	install( ...middlewares){
		for( let middleware of middlewares){
			// assign a unique symbol to this install
			const symbol= Symbol( middlewareName( middleware))

			// look for properties that have a `phase`
			for( let descriptor of getAllDescriptors( middleware)){
				const handler= middleware[ descriptor.name]
				let phases= handler[ $phases]!== undefined? handler[ $phases]: (handler.phases|| handler.phase)
				if( !phases){
					continue
				}
				if( !Array.isArray( phases)){
					phases= [ phases]
				}
				for( let item of phases){
					if( !this[ item.pipeline]){
						// warn? fail? middleware doesn't fit this PhasedMiddlewares
						// at the same time, don't want to make this impossible!
						continue
					}
					this[ item.pipeline].push({ handler, ...item, symbol})
				}
			}
			// look at `phases` on the middleware
			const middlewarePhases= middleware[ $phases]|| middleware.phases|| {}
			for( let [ pipelineName, phases] in Object.entries( middlewarePhases)){
				for( let [ phaseName, handlers] of Object.entries( phases|| {})){
					if( !Array.isArray( handlers)){
						handlers= [ handlers]
					}
					if( !this[ pipelineName]){
						// see: "warn? fail?" above
						continue
					}
					for( let handler of handlers){
						this[ pipelineName].push({ handler, pipeline: pipelineName, phase: phaseName, symbol})
					}
				}
			}
		}
		return this
	}
	*pipeline( pipelineName, state, ...args){
		const phasedrun= this[ pipelineName]
		if( !phasedRun){
			throw new Error(`Phased run '${pipelineName}' not found`)
		}
		const context= {
		  phasedMiddleware: this,
		  pipelineName,
		  phasedRun,
		  position: 0,
		  handler: null,
		  symbol: null,
		  args,
		  state,
		  output: null
		}
		while( context.position< phasedRun.length){
			const state= phasedRun.state[ context.position]
			context.symbol= state.symbol
			context.handler= phasedRun[ context.position]
			context.handler( context)
			yield context
			context.position++
		}
		return context
	}
	exec( pipelineName, state, ...args){
		const phasedrun= this[ pipelineName]
		if( !phasedRun){
			throw new Error(`Phased run '${pipelineName}' not found`)
		}
		const context= {
		  phasedMiddleware: this,
		  pipeline: name,
		  phasedRun,
		  position: 0,
		  handler: null,
		  symbol: null,
		  args,
		  state,
		  output: null
		}
		while( context.position< phasedRun.length){
			const state= phasedRun.state[ context.position]
			context.handler= phasedRun[ context.position]
			context.symbol= state.symbol
			context.handler( context)
			context.position++
		}
		return context
	}
}
export default PhasedMiddleware
