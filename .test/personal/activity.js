export class Activity{
	constructor( intensity){
		this.intensity= intensity|| 20
	}
	swim({ input, middleware, setValue}){
		console.log("swim")
		input.energy -= middleware.intensity
		setValue( input)
		return true
	}
	sleep({ input, setValue}){
		console.log("sleep")
		input.energy += 10
		setValue( input)
		return true
	}
}
export default Activity
// this is an alternative to having a phase() member
Activity.prototype.swim.phase = [{pipeline: "day", phase: "rise"}]
Activity.prototype.sleep.phase = {pipeline: "night", phase: "retire"}
