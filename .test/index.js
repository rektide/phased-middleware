import PhasedMiddleware from ".."
import Personal from "./personal/index.js"
import { defaults as personalPipelines } from "./personal/pipeline.js"
import Activity from "./personal/activity.js"
import Meals from "./personal/meals.js"
import Person from "./personal/person.js"
import tape from "tape"

tape( "build and run a personal pipeline", function( t){ 
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

tape( "test a single pipeline of activity", function( t){
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
