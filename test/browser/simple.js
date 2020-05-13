var Component = require('../../')
var html = require('nanohtml')

class SimpleComponent extends Component {
  constructor () {
    super()
    this.color = 'blue'
    this.name = 'yosh'
  }

  createElement (props) {
    this.color = props.color || this.color
    this.name = props.name || this.name

    return html`
      <div>
        <p class="name">${this.name}</p>
        <p class="color">${this.color}</p>
      </div>
    `
  }

  update (nextProps, lastProps) {
    return nextProps.color !== lastProps.color
  }
}

module.exports = SimpleComponent
