/**
 * Pieces of middleware can be installed multiple times, and we want a unique symbol for each install
 */
export class Namer{
	constructor({ map}= {}){
		this.map= map|| new WeakMap()
	}
	get( middleware){
	}
}
export default Namer
