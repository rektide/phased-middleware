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

const emptyObj= {}

function _val( value){
	return {
		value,
		writable: true
	}
}

export class PhasedMiddleware{
	constructor({ alias, cursor, extra, name, pipelines, plugins, $plugins: _plugins= [], $symbols: _symbols= []}){
		// initialize base state
		const properties= {
		  [ alias&& $alias]: alias&& _val( alias),
		  [ cursor&& $cursor]: cursor&& _val( cursor),
		  [ $name]: { value: name|| defaultName()},
		  [ pipelines&& $pipelines]: pipelines&& _val( pipelines),
		  [ _plugins&& $plugins]: _plugins&& _val( _plugins),
		  [ _symbols&& $symbols]: _symbols&& _val( _symbols)
		}
		// copy in extra props
		for( let [ propKey, propValue] of Object.entries( extra|| emptyObj)){
			properties[ propKey]= extra[ propKey]
		}
		// create each pipeline -- inhibited if was extraProp
		for( let [ pipelineName, phases] of Object.entries( pipelines|| emptyObj)){
			if( !properties[ pipelineName]){
				properties[ pipelineName]= { value: new PhasedRun( phases)}
			}
		}
		// TODO: perf test vs Object.assign'ing
		Object.defineProperties( this, properties)

		// install plugins into pipelines
		if( plugins&& plugins.length&& !(_plugins&& _plugins.length)){
			this.install( ...plugins)
		}
	}

	// getters (some are indexed)
	get alias(){
		return this[ $alias]
	}
	get cursor(){
		return this[ $cursor]
	}
	get name(){
		return this[ $name]
	}
	get pipelines(){
		return this[ $pipelines]
	}
	pipeline( name){
		return this.pipelines[ name]
	}
	plugin( i){
		return this.plugins[ i]
	}
	get plugins(){
		return this[ $plugins]
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
		return this.symbols[ i]
	}
	get symbols(){
		return this[ $symbols]
	}

	// methods
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
