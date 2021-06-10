Vue.component('collection', {
  props: ['collection', 'styles'],
  template: `
    <div class="collection">
      <bullet
        v-for="bullet in collection.bullets"
        :bullet="bullet"
        :styles="styles"
        :key="bullet.id"
        :ref="'bullet-' + bullet.id"
        v-on:edit-bullet-text="editBulletText"
        v-on:move-up="moveUp"
        v-on:move-down="moveDown"
        v-on:add-bullet="addBullet"
        v-on:remove-bullet="removeBullet"
        v-on:remove-bullet-style="removeStyle"></bullet>
    </div>
  `,
  methods: {
    editBulletText({id, newText}) {
      this.$emit(
        'edit-bullet-text',
        {collectionID: this.collection.id, bulletID: id, newText: newText})
    },
    addBullet({currentBullet, currentText}) {
      this.$emit('add-bullet', {currentCollection: this.collection, currentBullet: currentBullet, currentText: currentText})
    },
    removeBullet(currentBullet) {
      if (this.collection.bullets.length === 1) {
        this.$emit('remove-collection', this.collection)
      } else {
        this.$emit('remove-bullet', {currentCollection: this.collection, currentBullet: currentBullet})
      }
    },
    removeStyle(bulletID) {
      this.$emit(
        'remove-bullet-style',
        {collectionID: this.collection.id, bulletID: bulletID})
    },
    moveUp({currentBullet, event}) {
      var currentPos = currentBullet.position
      var previousBullet = this.collection.bullets.filter(
        bullet => bullet.position === currentPos - 1)[0]
      // move to previous bullet in same collection or else to bullet of
      // previous collection or title
      if (previousBullet) {
        this.moveTo({bullet: previousBullet, event: event})
      } else {
        this.$emit('move-up', {currentCollection: this.collection, event: event})
      }
    },
    moveDown({currentBullet, event}) {
      var currentPos = currentBullet.position
      var nextBullet = this.collection.bullets.filter(
        bullet => bullet.position === currentPos + 1)[0]
      // move to next bullet in same collection or else to bullet of
      // next collection
      if (nextBullet) {
        this.moveTo({bullet: nextBullet, event: event})
      } else {
        this.$emit('move-down', {currentCollection: this.collection, event: event})
      }
    },
    moveTo({bullet, event}) {
      // prevent click events. Pressing up/down shouldn't move cursor to
      // previous/next bullet and to the beginning/end
      this.$nextTick(() => {
        if (event) {
          event.preventDefault()
        }
        this.$refs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.$parent.setEndOfContenteditable(
          this.$refs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'))
      })
    },
  },
})
