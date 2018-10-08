// TODO: use field name in _phases when gathering
export function findPhases( middleware){
	const phases= {}
	for( const desc of getAllDescriptors( middleware)){
		const
		  name= desc.name|| desc.symbol,
		  member= middleware[ name]
		let
		  phase= member&& member.phase
		if( !phase){
			continue
		}

		// pluralize
		if( !phase[Symbol.iterator]){
			phase= [ phase]
		}
		for( let install of phase){
			let
			  pipeline= phases[ install.pipeline],
			  destPhase

			if( !pipeline){
				pipeline= phases[ install.pipeline]= {[ install.phase]: [ member]}
			}else if( destPhase= pipeline[ install.phase]){
				 destPhase.push( member)
			}else{
				pipeline[ install.phase]= [ member]
			}
		}
	}
	return phases
}
export default findPhases
