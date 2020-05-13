const choo = require('choo')
const html = require('nanohtml')
const Component = require('.')

function randomColor () {
  return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
}

class Button extends Component {
  constructor () {
    super()
    this.color = null
  }

  createElement (color, emit) {
    this.color = color

    function onclick () {
      emit('color', randomColor())
    }

    return html`
      <button style="background-color: ${color}" onclick=${onclick}>
        Click Me
      </button>
    `
  }

  // Implement conditional rendering
  update (newColor) {
    return newColor !== this.color
  }
}

const button = new Button()

function mainView (state, emit) {
  return html`<body>${button.render(state.color, emit)}</body>`
}

const app = choo()

app.route('/', mainView)
app.mount('body')

app.use(function (state, emitter) {
  state.color = 'white'

  emitter.on('color', color => {
    state.color = color
    emitter.emit('render')
  })
})
