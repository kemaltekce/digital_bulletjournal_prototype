Vue.component('bullet', {
  props: ['bullet', 'styles'],
  template: `
    <div class="bullet" :id="bullet.style">
      <div class="bullet-style" v-if="bullet.style">
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
        @keydown.delete="removeBullet"
        @keydown.space="addNewLine"
        @keydown.tab.prevent="addNewLine"></div>
    </div>
  `,
  methods: {
    edit(event) {
      var newText = event.target.innerText
      this.$emit('edit-bullet-text', {id: this.bullet.id, newText: newText})
    },
    keepTextWithoutCmd(event, bullet, text, cmd) {
      var adjusted_text = text.replace(cmd, '')
      this.$emit('edit-bullet-text', {id: bullet.id, newText: adjusted_text})
      event.target.innerText = adjusted_text
    },
    changeStyle(event, bullet, text, style) {
      this.keepTextWithoutCmd(event, bullet, text, "/" + style)
      if (style === 'empty') {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: undefined})
      } else {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: style})
      }
    },
    addCollection(event, bullet, text, cmd, place) {
      this.keepTextWithoutCmd(event, bullet, text, cmd)
      this.$emit('add-collection', {currentBullet: bullet, place: place})
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
      } else if (currentText.includes("/newcollup")) {
        this.addCollection(event, this.bullet, currentText, "/newcollup", 0)
      } else if (currentText.includes("/newcolldown")) {
        this.addCollection(event, this.bullet, currentText, "/newcolldown", 1)
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
    },
    addNewLine(event) {
      var currentText = event.target.innerText
      if (this.bullet.style === undefined) {
        if (event.code === 'Space') {
          if (/\s{2}/.test(currentText)) {
            this.changeStyle(event, this.bullet, currentText, "tab")
            this.keepTextWithoutCmd(event, this.bullet, currentText, /\s{2}/)
          }
        } else if (event.code === 'Tab') {
          this.changeStyle(event, this.bullet, currentText, "tab")
        }
      }
    },
  }
})
