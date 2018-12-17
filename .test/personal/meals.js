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
		const person= inputs[ 0]
		person.energy+= 3
		setOutput( person)
	}
	lunch({ inputs, setOutput} ){
		console.log( "lunch")
		const person= inputs[ 0]
		person.energy+= 3
		setOutput( person)
	}
	dinner({ inputs, setOutput}){
		console.log( "dinner")
		const person= inputs[ 0]
		person.energy+= 4
		setOutput( person)
	}
}
export default Meals
