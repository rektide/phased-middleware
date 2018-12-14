let nameSerial= 0
export function middlewareName( middleware){
	if( middleware.name){
		return `${middleware.name}-${nameSerial++}`
	}
	if( middleware.constructor){
		return middleware.constructor.name
	}
	return `phased-middleware-${nameSerial++}`
}

export function defaultName(){
	return `phased-${nameSerial++}`
}
