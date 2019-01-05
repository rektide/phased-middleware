import { $scope} from "./symbol.js"

function _default( defaultFn, def, target, prop, name){
	return defaultFn? defaultFn(): def
}

function aliasNames( arr){
	for( let i in get){
		const fn= get[i]
		arr[ fn.name]= fn
	}
}

export const get= [
	function plugin( cursor, prop){
		return cursor.plugin[ prop]
	},
	function cursor( cursor, prop){
		return cursor[ prop]
	},
	function handler( cursor, prop){
		return cursor.handler[ prop]
	},
	function staticPlugin( cursor, prop){
		return cursor.plugin.constructor[ prop]
	},
	function phasedMiddleware( cursor, prop){
		return cursor.phasedMiddleware[ prop]
	},
	function fixedPlugin( cursor, prop){ // dupe of plugin!
		return cursor.plugin[ prop]
	}
], scopeGet= get, ScopeGet= get
aliasNames( get)

export const set= [
	function plugin( cursor, prop, value){
		const
		  plugin= cursor.plugin,
		  instantiate= plugin[ $instantiate]
		// setting a singleton instance generates a fresh state
		if( instantiate!== undefined){
			const
			  hasInstantiateFn= instantiate!== true,
			  instance= hasInstantiateFn? instantiate.call( plugin): { prop: value},
			  symbol= cursor.symbol
			if( hasSingletonFn){
				instance[ prop]= value
			} // otherwise we created an instance
			// store value in the designated symbol:
			cursor.plugin= instance
		}
		// work like "plugin"
		return cursor.plugin
	},
	function cursor( cursor, prop, value){
		cursor[ prop]= value
		return cursor
	},
	function handler( cursor, prop, value){
		cursor.handler[ prop]= value
		return cursor.handler
	},
	function staticPlugin( cursor, prop, value){
		cursor.plugin.constructor[ prop]= value
		return cursor.plugin.constructor
	},
	function phasedMiddleware( cursor, prop, value){
		cursor.phasedMiddleware[ prop]= value
		return cursor.phasedMiddleware
	},
	// non-standard scopes:
	function fixedPlugin( cursor, prop, value){
		cursor.plugin[ prop]= value
		return cursor.plugin
	}
], scopeSet= set, ScopeSet= set
aliasNames( set)

export const
  plugin= {
	get: get.plugin,
	name: "plugin",
	set: set.plugin
  },
  cursor= {
	get: get.cursor,
	name: "cursor",
	set: set.cursor
  },
  handler= {
	get: get.handler,
	name: "handler",
	set: set.handler
  },
  staticPlugin= {
	get: get.staticPlugin,
	name: "staticPlugin",
	set: set.staticPlugin
  },
  phasedMiddleware= {
	get: get.phasedMiddleware,
	name: "phasedMiddleware",
	set: set.phasedMiddleware
  },
  // non-standard scopes:
  fixedPlugin= {
	get: get.fixedPlugin,
	name: "plugin",
	set: set.fixedPlugin
  }

export const scope= {
	plugin,
	cursor,
	handler,
	staticPlugin,
	phasedMiddleware
}, Scope= scope
export default scope

export const defaultScopes= [
	plugin,
	cursor,
	handler,
	staticPlugin,
	phasedMiddleware
], DefaultScopes= defaultScopes

export const defaultScopeNames= defaultScopes.map( scope=> scope.name)
