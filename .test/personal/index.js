import PhasedMiddleware from "../../phased-middleware.js"
import PersonalPipeline from "./pipeline.js"
import Activity from "./activity.js"
import Meals from "./meals.js"
import Person from "./person.js"

// our main contribution: a prebuilt phased middleware instance loaded with personal pipeline & plugins
export function PhasedMiddlewareInstance(){
	// install our middleware
	const phasedMiddlewareInstance= PersonalPipeline()
	phasedMiddlewareInstance.install(new Meals())
	phasedMiddlewareInstance.install(new Activity())
	return phasedMiddlewareInstance
}
export default PhasedMiddlewareInstance

export {
	// reexports
	PhasedMiddleware,
	PersonalPipeline,
	Meals,
	Activity,
	Person
}

export function person(){
	return Person()
}
