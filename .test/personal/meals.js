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
	breakfast({ value}){
		console.log("breakfast")
		value.energy += 3
		return value
	}
	lunch({ value} ){
		console.log("lunch")
		value.energy += 3
		return value
	}
	dinner({ value}){
		console.log("dinner")
		value.energy += 4
		return value
	}
}
export default Meals
