export class Activity{
	constructor( intensity){
		this.intensity= intensity|| 20
	}
	swim({ inputs, plugin, setOutput}){
		console.log( "swim")
		const person= inputs[ 0]
		person.energy-= plugin.intensity
		setOutput( person)
	}
	sleep({ inputs, setOutput}){
		console.log( "sleep")
		const person= inputs[ 0]
		person.energy+= 10
		setOutput( person)
	}
}
export default Activity
// this is an alternative to having a phase() member
Activity.prototype.swim.phase = [{pipeline: "day", phase: "rise"}]
Activity.prototype.sleep.phase = {pipeline: "night", phase: "retire"}
