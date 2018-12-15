export class Meals{
	get phases(){
		return {
			day: {
				rise: this.breakfast,
				shine: this.lunch
			},
			night: {
				retire: this.dinner
			}
		}
	}
	breakfast({ inputs, setOutput}){
		console.log( "breakfast")
		inputs.energy += 3
		setOutput( input)
	}
	lunch({ inputs, setOutput} ){
		console.log( "lunch")
		inputs.energy += 3
		setOutput( input)
	}
	dinner({ inputs, setOutput}){
		console.log( "dinner")
		inputs.energy += 4
		setOutput( input)
	}
}
export default Meals
