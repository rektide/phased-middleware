import PhasedMiddleware from "../.."

export const defaults= {
  pipelines: {
  	day: ["rise", "shine"],
  	night: ["retire", "rest"]
  }
}

export const pipeline= function({ pipelines}= defaults){
	return new PhasedMiddleware({ pipelines})
}
export default pipeline
