import PhasedMiddleware from "../.." // ~
import PersonalPipeline from "./pipeline.js"
import Activity from "./activity.js"
import Meal from "./meal.js"
import Person from "./person.js"

// our main contribution: a prebuilt phased middleware instance loaded with personal pipeline & plugins
export function PhasedMiddlewareInstance(){
	// install our middleware
	const phasedMiddlewareInstance= PersonalPipeline()
	phasedMiddlewareInstance.install(new Meals())
	phasedMiddlewareInstance.install(new Activity())
	return phasedMiddlewareInstance
}
export default pipeline

export {
	// reexports
	PhasedMiddleware,
	PersonalPipeline,
	Meal,
	Activity,
	Person
}

export function person(){
	return Person()
}

