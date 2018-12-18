import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import { pluginName, defaultName} from "./name.js"
import { $plugins, $name, $phases, $pipelines} from "./symbol.js"

export class PhasedMiddleware{
	constructor({ pipelines, plugins, name}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
	
		// initialize base state
		this[ $plugins]= plugins|| []
		this[ $name]= name|| defaultName()
		this[ $pipelines]= pipelines

		// create each pipeline
		for( let [ pipelineName, phases] of Object.entries( pipelines)){
			this[ pipelineName]= new PhasedRun( phases)
		}

		// install plugins into pipelines
		if( plugins){
			this.install( ...plugins)
		}
	}
	install( ...plugins){
		for( let plugin of plugins){
			// assign a unique symbol to this install
			const symbol= Symbol( pluginName( plugin))

			// save this middleware - first in list of middlewares
			const index= this[ $plugins].push({ plugin, symbol})
			// associate the symbol with the middlware instance, for fast lookup
			this[ symbol]= plugin

			// look for properties that have a `phase`
			for( let descriptor of getAllDescriptors( plugin)){
				const handler= plugin[ descriptor.name]
				let phases= handler[ $phases]!== undefined? handler[ $phases]: (handler.phases|| handler.phase)
				if( !phases){
					continue
				}
				if( !Array.isArray( phases)){
					phases= [ phases]
				}
				for( let item of phases){
					if( !this[ item.pipeline]){
						// warn? fail? plugin doesn't fit this PhasedMiddlewares
						// at the same time, don't want to make this impossible!
						continue
					}
					this[ item.pipeline].push({ handler, ...item, symbol})
				}
			}
			// look at `phases` on the plugin
			const pluginPhases= plugin[ $phases]|| plugin.phases|| {}
			for( let [ pipelineName, phases] of Object.entries( pluginPhases)){
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
		  // working material
		  inputs,
		  output: null,
		  setOutput: function( output){
			const oldValue= context.output
			context.output= output
			return oldValue
		  },
		  state,

		  // global context of run
		  phasedMiddleware: this,
		  phasedRun,
		  pipelineName,

		  // positional context
		  position: 0,
		  plugin: null,
		  handler: null,
		  symbol: null,
		}
		while( context.position< phasedRun.length){
			const item= phasedRun[ context.position]
			context.handler= item.handler
			context.plugin= this[ item.symbol]
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
		  // working material
		  inputs,
		  output: null,
		  setOutput: function( output){
			const oldValue= context.output
			context.output= output
			return oldValue
		  },
		  state,

		  // global context of run
		  phasedMiddleware: this,
		  phasedRun,
		  pipelineName,

		  // positional context
		  position: 0,
		  plugin: null,
		  handler: null,
		  symbol: null,
		}
		while( context.position< phasedRun.length){
			const item= phasedRun[ context.position]
			context.handler= item.handler
			context.plugin= this[ item.symbol]
			context.phase= item.phase
			context.symbol= item.symbol
			context.handler( context)
			context.position++
		}
		return context
	}
}
export default PhasedMiddleware
