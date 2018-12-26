let nameSerial= 0

export function namer( defaultPrefix){
	if( !defaultPrefix){
		throw new Error( "Prefix required")
	}
	return function( thing){
		//let prefix= (thing&& thing.name)|| (thing&& thing.constructor!== String&& thing.constructor.name)|| defaultPrefix
		let prefix= defaultPrefix
		return `${prefix}-${nameSerial++}`
	}
}
export default namer

export const pluginName= namer( "phased-plugin")

export const defaultName= namer( "phased-middleware")
