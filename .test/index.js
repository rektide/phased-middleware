import Personal from "./personal/index.js"
import Person from "./personal/person.js"
import tape from "tape"

tape( "build and run a personal pipeline", function( t){ 
	const
	  pipeline= Personal().pipeline,
	  person= Person()
	t.equal( person.energy, 10, "person starts with 10 energy")
	pipeline.day( person)
	t.equal( person.energy, -4, "day tires a person out")
	pipeline.night( person)
	t.equal( person.energy, 10, "persons recover during the night")
	t.end()
})
