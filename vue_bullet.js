Vue.component('bullet', {
  props: ['bullet', 'styles'],
  template: `
    <div class="bullet" :id="bullet.style">
      <div class="bullet-style" v-if="bullet.style" @click="iterateStyle">
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
        @keyup.space="executeShortCmd"
        @keydown.tab.prevent="executeShortCmd"
        @keydown.alt.188.capture.prevent.stop="iteratePage"></div>
    </div>
  `,
  methods: {
    iteratePage() {this.$emit('iterate-page')},
    edit(event) {
      // edit text after next tick, because if sidepage is closed with the cmd
      // /sidepage the bullet will not exist anymore to focus on. With the next
      // tick the emit will stop propagating to the collection because it doesn't
      // exist anymore.
      this.$nextTick(() => {
        var newText = event.target.innerText
        this.$emit('edit-bullet-text', {id: this.bullet.id, newText: newText})
      })
    },
    keepTextWithoutCmd(event, bullet, text, cmd) {
      // real commands start with a '/' and need to be removed from the text
      if (/\//.test(cmd)) {
        var adjusted_text = text.replace(cmd, '')
      // the rest are short cmd which are only allowed at the beginning
      // and are two elements long
      } else {
        var adjusted_text = text.splice(2)
      }
      this.$emit('edit-bullet-text', {id: bullet.id, newText: adjusted_text})
      var offset
      if (cmd === '/tab') {
        // tab is not an actual text we removed
        offset = window.getSelection()['anchorOffset']
      } else if (cmd instanceof RegExp) {
        // regex is used for short cmd. The short cmd are all 2 elements long
        offset = window.getSelection()['anchorOffset'] - 2
      } else {
        // adjust offset to match offset without cmd
        offset = window.getSelection()['anchorOffset'] - cmd.length
      }
      event.target.innerText = adjusted_text
      this.$root.setEndOfContenteditable(this.$el.querySelector('.bullet-text'), offset)
    },
    changeStyle(event, bullet, text, style) {
      this.keepTextWithoutCmd(event, bullet, text, "/" + style)
      if (style === 'empty') {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: undefined})
      } else {
        this.$emit('change-bullet-style', {id: bullet.id, newStyle: style})
      }
    },
    iterateStyle(event) {
      const iterateableStyles = ['todo', 'done', 'migrate', 'future', 'note'];
      var isStyle = (element) => element === this.bullet.style
      var currentStyleIndex = iterateableStyles.findIndex(isStyle)
      if (currentStyleIndex === iterateableStyles.length - 1) {
        currentStyleIndex = -1
      }
      this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: iterateableStyles[currentStyleIndex + 1]})
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
      } else if (currentText.includes("/h1")) {
        this.changeStyle(event, this.bullet, currentText, "h1")
      } else if (currentText.includes("/h2")) {
        this.changeStyle(event, this.bullet, currentText, "h2")
      } else if (currentText.includes("/newcollup")) {
        this.addCollection(event, this.bullet, currentText, "/newcollup", 0)
      } else if (currentText.includes("/newcolldown")) {
        this.addCollection(event, this.bullet, currentText, "/newcolldown", 1)
      } else if (currentText.includes("/nav")) {
        this.keepTextWithoutCmd(event, this.bullet, currentText, "/nav")
        this.$emit('change-pagenav-visibility')
      } else if (currentText.includes("/sidepage")) {
        this.keepTextWithoutCmd(event, this.bullet, currentText, "/sidepage")
        this.$emit('change-sidepage-visibility')
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
    executeShortCmd(event) {
      var currentText = event.target.innerText
      var shortCmd = currentText.slice(0, 2)
      if (event.code === 'Space' && window.getSelection()['anchorOffset'] === 2) {
        if (/\s{2}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, /\s{2}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'tab'})
        } else if (/\.\s{1}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, /\.\s{1}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'todo'})
        } else if (/x\s{1}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, /x\s{1}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'done'})
        } else if (/<\s{1}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, /<\s{1}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'future'})
        } else if (/>\s{1}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, />\s{1}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'migrate'})
        } else if (/-\s{1}/.test(shortCmd)) {
          this.keepTextWithoutCmd(event, this.bullet, currentText, /-\s{1}/)
          this.$emit('change-bullet-style', {id: this.bullet.id, newStyle: 'note'})
        }
      }
      if (this.bullet.style === undefined && event.code === 'Tab') {
        this.changeStyle(event, this.bullet, currentText, "tab")
      }
    },
  }
})
