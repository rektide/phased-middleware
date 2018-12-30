import { $scope} from "./symbol.js"

function _default( defaultFn, default, target, prop, name){
	return defaultFn? defaultFn(): default
}

export const get= [
	function handler( cursor, prop){
		return cursor.handler[ prop]
	},
	function plugin( cursor, prop){
		return cursor.plugin[ prop]
	},
	function cursor( cursor, prop){
		return cursor[ prop]
	},
	function staticPlugin( cursor, prop){
		return cursor.plugin.constructor[ prop]
	},
	function phasedMiddleware( cursor, prop){
		return cursor.phasedMiddleware[ prop]
	}
}, scopeGet= get, ScopeGet= get

export const set= [
	function handler( cursor, prop, value){
		cursor.handler[ prop]= value
		return cursor.handler
	},
	function plugin( cursor, prop, value){
		cursor.plugin[ prop]= value
		return cursor.plugin
	},
	function cursor( cursor, prop, value){
		cursor[ prop]= value
		return cursor
	},
	function staticPlugin( cursor, prop, value){
		cursor.plugin.constructor[ prop]= value
		return cursor.plugin.constructor
	},
	function phasedMiddleware( cursor, prop, value){
		cursor.phasedMiddleware[ prop]= value
		return cursor.phasedMiddleware
	}
], scopeSet= set, ScopeSet= set


export const
  handler: {
	get: get.handler,
	name: "handler",
	set: set.handler
  },
  plugin: {
	get: get.plugin,
	name: "plugin",
	set: set.plugin
  },
  cursor: {
	get: get.cursor,
	name: "cursor",
	set: set.cursor
  },
  staticPlugin: {
	get: get.staticPlugin,
	name: "staticPlugin",
	set: set.staticPlugin
  },
  phasedMiddleware: {
	get: get.phasedMiddleware,
	name: "phasedMiddleware",
	set: set.phasedMiddleware
  }
}

const scope= {
	handler,
	plugin,
	cursor,
	staticPlugin,
	phasedMiddleware
}, Scope= scope

export defaultScopes= [
	handler,
	plugin,
	cursor,
	staticPlugin,
	phasedMiddleware
], DefaultScopes

export defaultScopeNames= defaultScopes.map( scope=> scope.name)
