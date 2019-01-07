import getAllDescriptors from "get-property-descriptor/get-all-descriptors.js"
import PhasedRun from "phased-run"

import Cursor from "./cursor.js"
import { pluginName, defaultName} from "./name.js"
import {
  $alias,
  $cursor,
  $name,
  $phases,
  $pipelines,
  $plugins,
  $symbols
} from "./symbol.js"

export class PhasedMiddleware{
	constructor({ alias, cursor, name, pipelines, plugins, $plugins: _plugins= [], $symbols: _symbols= []}){
		if( !pipelines){
			throw new Error("Expected 'pipelines'")
		}
	
		// initialize base state
		this[ $name]= name|| defaultName()
		this[ $pipelines]= pipelines
		this[ $plugins]= _plugins
		this[ $symbols]= _symbols
		if( alias){
			this[ $alias]= alias
		}
		if( cursor){
			this[ $cursor]= cursor
		}

		// create each pipeline
		for( let [ pipelineName, phases] of Object.entries( pipelines)){
			this[ pipelineName]= new PhasedRun( phases)
		}

		// install plugins into pipelines
		if( plugins&& plugins.length){
			this.install( ...plugins)
		}
	}
	get name(){
		return this[ $name]
	}
	get pipelines(){
		return this[ $pipelines]
	}
	plugin( i){
		return this[ $plugins][ i]
	}
	pluginIndex( plugin){
		return this.plugins.indexOf( plugin)
	}
	pluginSymbol( plugin){
		const index= this.pluginIndex( plugin)
		return this.symbol( index)
	}
	pluginData( plugin){
		return this[ this.pluginSymbol( plugin)]
	}
	symbol( i){
		return this[ $symbols][ i]
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

			// no. we used to do this, but now plugins and data are separate
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
					const
					  name= this[ $alias]&& this[ $alias][ item.pipeline]|| item.pipeline,
					  pipeline= this[ name]
					if( !pipeline){
						// warn? fail? plugin doesn't fit this PhasedMiddlewares
						// at the same time, don't want to make this impossible!
						continue
					}
					pipeline.push({ handler, plugin, ...item, i})
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
						const
						  name= this[ $alias]&& this[ $alias][ pipelineName]|| pipelineName,
						  pipeline= this[ name]
						pipeline.push({ handler, plugin, pipeline: pipelineName, phase: phaseName, i})
					}
				}
			}
		}
		return this
	}
	*pipeline( pipelineName, state, symbols= this.symbols, ...inputs){
		const klass= this[ $cursor]|| Cursor
		yield* new klass({
		  phasedMiddleware: this,
		  pipelineName,
		  state,
		  inputs,
		  symbols})
	}
	exec( pipelineName, state, symbols= this.symbols, ...inputs){
		const
		  klass= this[ $cursor]|| Cursor,
		  cursor= new klass({
			phasedMiddleware: this,
			pipelineName,
			state,
			inputs,
			symbols
		  })
		while( !cursor.next().done){
			cursor.middleware.handler( cursor)
		}
		return cursor.output
	}
}
export default PhasedMiddleware
