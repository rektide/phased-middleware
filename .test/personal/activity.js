export class Activity{
	constructor( intensity){
		this.intensity= intensity|| 20
	}
	swim({ value, middleware}){
		console.log("swim")
		value.energy -= middleware.intensity
		return value
	}
	sleep({ value}){
		console.log("sleep")
		value.energy += 10
		return value
	}
}
export default Activity
// this is an alternative to having a phase() member
Activity.prototype.swim.phase = [{pipeline: "day", phase: "rise"}]
Activity.prototype.sleep.phase = {pipeline: "night", phase: "retire"}
