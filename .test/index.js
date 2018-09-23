import PhasedMiddleware from ".."
import Personal from "./personal/index.js"
import { defaults as personalPipelines } from "./personal/pipeline.js"
import Activity from "./personal/activity.js"
import Meals from "./personal/meals.js"
import Person from "./personal/person.js"
import tape from "tape"

tape( "basic operation of two middleware, a person eating & active", function( t){ 
	const
	  exec= Personal().exec,
	  person= Person()
	t.equal( person.energy, 10, "person starts with 10 energy")
	exec.day( person)
	t.equal( person.energy, -4, "day tires a person out")
	exec.night( person)
	t.equal( person.energy, 10, "persons recover during the night")
	t.end()
})

tape( "basic operation of a single middleware", function( t){
	const
	  phasedMiddleware= new PhasedMiddleware( personalPipelines),
	  person= Person()
	t.equal( person.energy, 10, "person starts with 10 nergy")
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 10, "nothing happens during the day with nothing installed")

	phasedMiddleware.install(new Meals())
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 16, "person now eats meals during the day & gets energy")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 20, "person now eats meals at night & gains energy")
	t.end()
})

tape( "basic operation of a single middleware", function( t){
	const
	  phasedMiddleware= new PhasedMiddleware( personalPipelines),
	  person= Person()
	t.equal( person.energy, 10, "person starts with 10 nergy")
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 10, "nothing happens during the day with nothing installed")

	phasedMiddleware.install(new Activity())
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, -10, "swimming tires person out")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 0, "sleeping restores a perseon")
	t.end()
})

tape( "installed middleware can be changed over time", function( t){
	const
	  phasedMiddleware= new PhasedMiddleware( personalPipelines),
	  person= Person()
	// day one, & night one
	t.equal( person.energy, 10, "person starts with 10 nergy")
	phasedMiddleware.install(new Meals())
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 16, "a person gains 6 energy from breakfast & lunch in the day")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 20, "a person gains 4 energy from dinner in the night")

	// day two, & night two
	phasedMiddleware.install(new Activity())
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 6, "person eats lunch & breakfast & swims")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 20, "person has dinner & sleeps")
	t.end()
})

tape( "one instance of middleware can be installed twice", function( t){
	const
	  phasedMiddleware= new PhasedMiddleware( personalPipelines),
	  person= Person(),
	  meals= new Meals()
	// day one, & night one
	t.equal( person.energy, 10, "person starts with 10 nergy")
	phasedMiddleware.install( meals)
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 16, "a person gains 6 energy from breakfast & lunch in the day")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 20, "a person gains 4 energy from dinner in the night")

	// day two: eat again
	phasedMiddleware.install( meals) // reinstall the same middleware
	phasedMiddleware.exec.day( person)
	t.equal( person.energy, 32, "person eats two breakfast & lunches")
	phasedMiddleware.exec.night( person)
	t.equal( person.energy, 40, "person has two dinners")
	t.end()
})
