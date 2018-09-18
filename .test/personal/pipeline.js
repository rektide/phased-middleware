export const pipeline= function(){
	return new PhasedMiddleware({
		pipelines: {
			day: ["rise", "shine"],
			night: ["retire", "rest"]
		}
	})
})
export default pipeline
