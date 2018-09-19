import Personal from "./personal/index.js"
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
