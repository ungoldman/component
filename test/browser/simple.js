var Component = require('../../')
var html = require('nanohtml')

class SimpleComponent extends Component {
  constructor (name) {
    super()
    this.name = name
    this.color = null
  }

  createElement (color) {
    this.color = color || 'blue'
    return html`
      <div>
        <p class="name">${this.name}</p>
        <p class="color">${this.color}</p>
      </div>
    `
  }

  update (color) {
    return this.color !== color
  }
}

module.exports = SimpleComponent
