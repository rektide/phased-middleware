export const defaultPrefix= "phased-middleware"

export const
  instantiate= Symbol.for( "phased-middleare:instantiate"),
  Instantiate= instantiate,
  $instantiate= instantiate,
  name= Symbol.for( `${defaultPrefix}:name`),
  Name= name,
  $name= name,
  phases= Symbol.for( `${defaultPrefix}:phases`),
  Phases= phases,
  $phases= phases,
  pipelines= Symbol.for( `${defaultPrefix}:pipelines`),
  Pipelines= pipelines,
  $pipelines= pipelines,
  plugins= Symbol.for( `${defaultPrefix}:middlewares`),
  Plugins= plugins,
  $plugins= plugins,
  symbols= Symbol.for( `${defaultPrefix}:symbol`),
  Symbols= symbols,
  $symbols= symbols

// cursor.js
export const
  scope= Symbol.for( `${defaultPrefix}:scope`),
  Scope= scope,
  $scope= scope

// name.js
export const
  namePrefix= Symbol.for( `${defaultPrefix}:namePrefix`),
  NamePrefix= namePrefix,
  $namePrefix= namePrefix
