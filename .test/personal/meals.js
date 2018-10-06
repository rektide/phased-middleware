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
	breakfast({ input, setValue}){
		console.log("breakfast")
		input.energy += 3
		setValue( input)
		return true
	}
	lunch({ input, setValue} ){
		console.log("lunch")
		input.energy += 3
		setValue( input)
		return true
	}
	dinner({ input, setValue}){
		console.log("dinner")
		input.energy += 4
		setValue( input)
		return true
	}
}
export default Meals
