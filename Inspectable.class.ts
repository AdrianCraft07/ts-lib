const DenoSymbol = Symbol.for('Deno.customInspect')
const NodeSymbol = Symbol.for('nodejs.util.inspect.custom')

export default class Inspecteable {
  toConsole(){
    return `\u001b[35m${this.toString()}\u001b[39m`
  }
  [DenoSymbol](){
    return this.toConsole()
  }
  [NodeSymbol](){
    return this.toConsole()
  }
}