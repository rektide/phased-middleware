const pipeline = new PhasedMiddleware({
	pipelines: {
		day: ["rise", "shine"],
		night: ["retire", "rest"]
	}
})

