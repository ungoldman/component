var Component = require('../')
var test = require('tape')
var html = require('nanohtml')

test('should validate input types', (t) => {
  t.plan(1)
  var comp = new Component()
  t.throws(comp.render.bind(comp), /createElement should be implemented/)
})

test('should render elements', (t) => {
  t.plan(2)

  class MyComp extends Component {
    createElement (props) {
      return html`<div>${props.name}</div>`
    }

    update () {
      return false
    }
  }

  var myComp = new MyComp()

  var el1 = myComp.render({ name: 'mittens' })
  t.equal(String(el1), '<div>mittens</div>', 'init render success')

  var el3 = myComp.render({ name: 'scruffles' })
  t.equal(String(el3), '<div>scruffles</div>', 're-render success')
})
