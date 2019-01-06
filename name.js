import { defaultPrefix, $namePrefix} from "./symbol.js"

export { $namePrefix}

let nameSerial= 0

export function namerFactory( ...prefixes){
	function namer( thing){
		let name= ""
		if( thing){
			name= thing[ $namePrefix]||( thing&& thing.constructor!== Object&& thing.constructor!== String&& thing.constructor.name)|| ""
		}
		const nameSep= name!== ""? ":": ""
		return `${namer.prefixes}:${name}${nameSep}${nameSerial++}`
	}
	namer.prefixes= prefixes.join( ":")
	namer.extend= function( ...more){
		return namerFactory( ...namer.prefixes, ...more)
	}
	return namer
}
const
  NamerFactory= namerFactory,
  namer= namerFactory,
  Namer= namerFactory
export default namer

export const
  defaultName= namer( defaultPrefix),
  pluginName= namer( defaultPrefix, "plugin")
