import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import Cursor from "./cursor.js"
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
		yield* new Cursor({
		  phasedMiddleware: this,
		  pipelineName,
		  state,
		  inputs})
	}
	exec( pipelineName, state, ...inputs){
		const cursor= new Cursor({
		  phasedMiddleware: this,
		  pipelineName,
		  state,
		  inputs})
		for( const el of cursor){
			el.handler( el)
		}
		return cursor.output
	}
}
export default PhasedMiddleware
