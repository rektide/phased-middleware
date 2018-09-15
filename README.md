# Phased Middleware

> A middleware system based around installable/uninstallable plugins running through a series of phases

With many middlware systems (such as the `express` module's built in one), it's up to the developer to assemble the various pieces of middleware in order. Phased Middleware is a generally useful alternative for assembling code pipelines that features:
* Named, in orer 'phases' of the pipeline, as for example seen in [Maven's build pipeline](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html#Build_Lifecycle_Basics).
* Middleware that can install/uninstall itself into the pipeline in known places.
* Installations of middleware are given their own semi-private piece of state, both per-middleware instance, and per execution.
* Can manage multiple simultaenous pipelines that plugins install into.

# Usage

```
import PhasedMiddleware from "phased-middleware"
const pipeline = new PhasedMiddleware({
	pipelines: {
		day: ["rise", "shine"],
		night: ["retire", "rest"]
	}
})
class Meals{
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
	breakfast( exec){
		console.log("breakfast")
		exec.energy += 3
	}
	lunch( exec){
		console.log("lunch")
		exec.energy += 3
	}
	dinner( exec){
		console.log("dinner")
		exec.energy += 4
	}
}
class Activity{
	constructor( intensity){
		this.intensity= intensity|| 20
	}
	swim( target, pipeline, step){
		console.log("swim")
		exec.energy -= exec.step().intensity
	}
	sleep( target, pipeline){
		console.log("sleep")
		object.energy += 10
	}
}
Activity.prototype.swim.phase = "rise"
Activity.prototype.sleep.phase = "retire"

// install our middleware
phasedMiddleware.install(new Meals())
phasedMiddleware.install(new Activity())

// run our pipelines
const person= { energy: 10}
phasedMiddleware.pipeline.day( person) //=> "breakfast" "swim" "lunch"
console.log( person.energy) //=> -4
phasedMiddleware.pipeline.night( person) //=> "dinner" "sleep"
console.log(person.energy) //=> 10
```
