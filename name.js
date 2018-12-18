let nameSerial= 0
export function pluginName( plugin){
	if( plugin.name){
		return `${plugin.name}-${nameSerial++}`
	}
	if( plugin.constructor){
		return plugin.constructor.name
	}
	return `phased-plugin-${nameSerial++}`
}

export function defaultName(){
	return `phased-${nameSerial++}`
}
