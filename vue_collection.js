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
        v-on:move-down="moveDown"></bullet>
    </div>
  `,
  methods: {
    editBulletText({id, newText}) {
      this.$emit(
        'edit-bullet-text',
        {collectionID: this.collection.id, bulletID: id, newText: newText})
    },
    moveUp({currentBullet, event}) {
      var currentPos = currentBullet.position
      var previousBullet = this.collection.bullets.filter(
        bullet => bullet.position === currentPos - 1)[0]
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
      if (nextBullet) {
        this.moveTo({bullet: nextBullet, event: event})
      } else {
        this.$emit('move-down', {currentCollection: this.collection, event: event})
      }
    },
    moveTo({bullet, event}) {
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
