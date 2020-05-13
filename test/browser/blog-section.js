var Component = require('../../')
var html = require('nanohtml')

class BlogSection extends Component {
  createElement (props) {
    this.entries = props.entries || null
    return html`
      <section>
        ${this.entries && this.entries.length > 0 ? this.entries.map(e => html`<p>${e}</p>`) : 'No entries'}
      </section>
    `
  }

  update (nextProps, lastProps) {
    const { entries } = nextProps
    if (entries !== this.entries || this.entries.some((e, i) => e !== entries[i])) return true
    return false
  }
}

module.exports = BlogSection
