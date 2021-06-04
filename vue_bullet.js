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
    moveUp(event) {this.$emit('move-up', {currentBullet: this.bullet, event: event})},
    moveDown(event) {this.$emit('move-down', {currentBullet: this.bullet, event: event})},
    endEdit(event) {
      var currentText = event.target.innerText
      this.$emit('add-bullet', {currentBullet: this.bullet, currentText: currentText})
    },
    removeBullet(event) {
      if (event.target.innerText.length === 0) {
        this.$emit('remove-bullet', this.bullet)
        this.$nextTick(() => {
            event.preventDefault()
        })
      }
    }
  }
})
