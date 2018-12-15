export class Activity{
	constructor( intensity){
		this.intensity= intensity|| 20
	}
	swim({ inputs, middleware, setOutput}){
		console.log( "swim")
		inputs.energy-= middleware.intensity
		setOutput( input)
	}
	sleep({ inputs, setOutput}){
		console.log( "sleep")
		inputs.energy += 10
		setOutput( input)
	}
}
export default Activity
// this is an alternative to having a phase() member
Activity.prototype.swim.phase = [{pipeline: "day", phase: "rise"}]
Activity.prototype.sleep.phase = {pipeline: "night", phase: "retire"}
