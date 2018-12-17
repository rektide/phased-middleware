import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import Iterator from "./iterator.js"
import { middlewareName, defaultName} from "./name.js"
import { $middlewares, $name, $phases, $pipelines} from "./symbol.js"
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

			// save this middleware - first in list of middlewares
			const index= this[ $middlewares].push({ middleware, symbol})
			// associate the symbol with the middlware instance, for fast lookup
			this[ symbol]= middleware

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
			for( let [ pipelineName, phases] of Object.entries( middlewarePhases)){
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
	*pipeline( pipelineName, state, ...inputs){
		const phasedRun= this[ pipelineName]
		if( !phasedRun){
			throw new Error(`Phased run '${pipelineName}' not found`)
		}
		const context= {
		  // global context of run
		  phasedMiddleware: this,
		  pipelineName,
		  phasedRun,
		  state,
		  input,
		  output: null,
		  setOutput: function( output){
			const oldValue= context.output
			context.output= output
			return oldValue
		  },

		  // positional context
		  position: 0,
		  middleware: null,
		  handler: null,
		  symbol: null,
		}
		while( context.position< phasedRun.length){
			const item= phasedRun[ context.position]
			context.handler= item.handler
			context.middleware= this[ item.symbol]
			context.phase= item.phase
			context.symbol= item.symbol
			yield context
			context.position++
		}
		return context
	}
	exec( pipelineName, state, ...inputs){
		const phasedRun= this[ pipelineName]
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
		  state,
		  inputs,
		  output: null,
		  setOutput: function(output){
			const oldOutput= context.output
			context.output= output
			return oldOutput
		  }
		}
		while( context.position< phasedRun.length){
			const item= phasedRun[ context.position]
			context.handler= item.handler
			context.middleware= this[ item.symbol]
			context.phase= item.phase
			context.symbol= item.symbol
			context.handler( context)
			context.position++
		}
		return context
	}
}
export default PhasedMiddleware
