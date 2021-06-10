Vue.component('bullet', {
  props: ['bullet', 'styles'],
  template: `
    <div class="bullet">
      <div class="bullet-style" v-if="bullet.style" :id="bullet.style">
        <span v-html="styles[bullet.style].content" :class="styles[bullet.style].style"></span>
      </div>
      <div
        class="bullet-text"
        contenteditable="true"
        v-text="bullet.text"
        @blur="edit"
        @keydown.up="moveUp"
        @keydown.down="moveDown"
        @keydown.enter.prevent="endEdit"
        @keydown.delete="removeBullet"></div>
    </div>
  `,
  methods: {
    edit(event) {
      var newText = event.target.innerText
      this.$emit('edit-bullet-text', {id: this.bullet.id, newText: newText})
    },
    changeStyle(event, bullet, text, style) {
      var adjusted_text = text.replace("/" + style, '')
      this.$emit('edit-bullet-text', {id: bullet.id, newText: adjusted_text})
      event.target.innerText = adjusted_text
      if (style === 'empty') {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: undefined})
      } else {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: style})
      }
    },
    moveUp(event) {this.$emit('move-up', {currentBullet: this.bullet, event: event})},
    moveDown(event) {this.$emit('move-down', {currentBullet: this.bullet, event: event})},
    endEdit(event) {
      var currentText = event.target.innerText
      if (currentText.includes("/done")) {
        this.changeStyle(event, this.bullet, currentText, "done")
      } else if (currentText.includes("/todo")) {
        this.changeStyle(event, this.bullet, currentText, "todo")
      } else if (currentText.includes("/empty")) {
        this.changeStyle(event, this.bullet, currentText, "empty")
      } else if (currentText.includes("/note")) {
        this.changeStyle(event, this.bullet, currentText, "note")
      } else if (currentText.includes("/migrate")) {
        this.changeStyle(event, this.bullet, currentText, "migrate")
      } else if (currentText.includes("/future")) {
        this.changeStyle(event, this.bullet, currentText, "future")
      } else if (currentText.includes("/heading")) {
        this.changeStyle(event, this.bullet, currentText, "heading")
      } else {
        this.$emit('add-bullet', {currentBullet: this.bullet, currentText: currentText})
      }
    },
    removeBullet(event) {
      // delete bullet
      if (event.target.innerText.length === 0 && this.bullet.style === undefined) {
        this.$emit('remove-bullet', this.bullet)
        // prevent deleting character in next bullet
        this.$nextTick(() => {
            event.preventDefault()
        })
      // delete style
      } else if (window.getSelection()['anchorOffset'] === 0 && this.bullet.style) {
        this.$emit('remove-bullet-style', this.bullet.id)
      }
    }
  }
})
