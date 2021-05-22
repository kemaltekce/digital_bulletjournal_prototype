Vue.component('bullet', {
  props: ['bullet'],
  template: `
    <div class="bullet">
      <div
        class="bullet-text"
        contenteditable="true"
        v-text="bullet.text"
        @blur="edit"></div>
    </div>
  `,
  methods: {
    edit(event) {
      var newText = event.target.innerText
      this.$emit('edit-bullet-text', {id: this.bullet.id, newText: newText})
    },
  }
})
