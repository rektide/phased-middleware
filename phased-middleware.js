import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import Cursor from "./cursor.js"
import { pluginName, defaultName} from "./name.js"
import {
  $name,
  $phases,
  $pipelines,
  $plugins,
  $symbols
} from "./symbol.js"

export class PhasedMiddleware{
	constructor({ pipelines, plugins, name}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
	
		// initialize base state
		this[ $name]= name|| defaultName()
		this[ $pipelines]= pipelines
		this[ $plugins]= []
		this[ $symbols]= []

		// create each pipeline
		for( let [ pipelineName, phases] of Object.entries( pipelines)){
			this[ pipelineName]= new PhasedRun( phases)
		}

		// install plugins into pipelines
		if( plugins&& plugins.length){
			this.install( ...plugins)
		}
	}
	get pipelines(){
		return this[ $pipelines]
	}
	get plugins(){
		return this[ $plugins]
	}
	get symbols(){
		return this[ $symbols]
	}
	install( ...plugins){
		// save all middleware
		const
		  oldPlugins= this[ $plugins],
		  oldLen= oldPlugins.length,
		  allPlugins= this[ $plugins]= [ ...oldPlugins, ...plugins],
		  newSymbols= plugins.map( plugin=> Symbol( pluginName( plugin))),
		  allSymbols= this[ $symbols]= [ ...this[ $symbols], ...newSymbols]
		for( let i= oldLen; i< allPlugins.length; ++i){
			const
			  plugin= allPlugins[ i],
			  // assign a unique symbol to this install
			  symbol= allSymbols[ i]

			// no.
			// associate the symbol with the middlware instance, for fast lookup
			//this[ symbol]= plugin

			// look for properties that have a `phase`
			for( let descriptor of getAllDescriptors( plugin)){
				const handler= plugin[ descriptor.name]
				if( !handler){
					continue
				}
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
					this[ item.pipeline].push({ handler, plugin, ...item, i, symbol})
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
						this[ pipelineName].push({ handler, plugin, pipeline: pipelineName, phase: phaseName, i, symbol})
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
		while( !cursor.next().done){
			cursor.middleware.handler( cursor)
		}
		return cursor.output
	}
}
export default PhasedMiddleware
