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
        @keydown.down="moveDown"></div>
    </div>
  `,
  methods: {
    edit(event) {
      var newText = event.target.innerText
      this.$emit('edit-bullet-text', {id: this.bullet.id, newText: newText})
    },
    moveUp(event) {this.$emit('move-up', {currentBullet: this.bullet, event: event})},
    moveDown(event) {this.$emit('move-down', {currentBullet: this.bullet, event: event})},
  }
})
