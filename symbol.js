export const defaultPrefix= "phased-middleware"

export const
  alias= Symbol.for( `${defaultPrefix}:alias`),
  Alias= alias,
  $alias= alias,
  cursor= Symbol.for( `${defaultPrefix}:cursor`),
  Cursor= cursor,
  $cursor= cursor,
  install= Symbol.for( `${defaultPrefix}:install`),
  Install= install,
  $install= install,
  instantiate= Symbol.for( `${defaultPrefix}:instantiate`),
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
  plugins= Symbol.for( `${defaultPrefix}:plugins`),
  Plugins= plugins,
  $plugins= plugins,
  singleton= Symbol.for( `${defaultPrefix}:singleton`),
  Singleton= singleton,
  $singleton= singleton,
  symbols= Symbol.for( `${defaultPrefix}:symbols`),
  Symbols= symbols,
  $symbols= symbols

// cursor.js
export const
  getter= Symbol.for( `${defaultPrefix}:cursor:getter`),
  Getter= getter,
  $getter= getter,
  scope= Symbol.for( `${defaultPrefix}:cursor:scope`),
  Scope= scope,
  $scope= scope

// name.js
export const
  namePrefix= Symbol.for( `${defaultPrefix}:name:namePrefix`),
  NamePrefix= namePrefix,
  $namePrefix= namePrefix
