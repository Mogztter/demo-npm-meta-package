(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory
    // AMD. Register a named module.
    define('metapkg', ['module'], function (module) {
      return factory(module.config())
    })
  } else {
    root.MetaPkg = factory
  }
}(this, function () {
  return {
    getVersion: () => '0.0.1'
  }
}))
