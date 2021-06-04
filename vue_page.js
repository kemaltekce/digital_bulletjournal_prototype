Vue.component('page', {
  props: ['title', 'collections', 'styles'],
  template: `
    <div class="page">
      <pagetitle
        :title="title"
        v-on:edit-page-title="editPageTitle"
        v-on:move-to-first-bullet="moveToFirstBullet"></pagetitle>
      <div class="collections">
        <collection
          v-for="collection in collections"
          :collection="collection"
          :styles="styles"
          :key="collection.id"
          :ref="'collection-' + collection.id"
          v-on:edit-bullet-text="editBulletText"
          v-on:move-down="moveDown"
          v-on:move-up="moveUp"
          v-on:add-bullet="addBullet"
          v-on:remove-bullet="removeBullet"></collection>
      </div>
    </div>
  `,
  methods: {
    editPageTitle(newTitle) {
      this.$emit('edit-page-title', newTitle)
    },
    moveToFirstBullet(event) {
      var nextCollection = this.collections[0]
      var nextBullet = nextCollection.bullets[0]
      this.moveTo({bullet: nextBullet, collection: nextCollection, event: event})
    },
    editBulletText({collectionID, bulletID, newText}) {
      this.$emit('edit-bullet-text', {collectionID, bulletID, newText})
    },
    addBullet({currentCollection, currentBullet, currentText}) {
      this.$emit('add-bullet', {currentCollection, currentBullet, currentText})
    },
    removeBullet({currentCollection, currentBullet}) {
      this.$emit('remove-bullet', {currentCollection, currentBullet})
    },
    moveDown({currentCollection, event}) {
      var currentPos = currentCollection.position
      var nextCollection = this.collections.filter(
        collection => collection.position == currentPos + 1)[0]
      if (nextCollection) {
        var nextBullet = nextCollection.bullets[0]
        this.moveTo({bullet: nextBullet, collection: nextCollection, event: event})
      }
    },
    moveUp({currentCollection, event}) {
      var currentPos = currentCollection.position
      var previousCollection = this.collections.filter(
        collection => collection.position == currentPos - 1)[0]
      if (previousCollection) {
        var lastPosition = previousCollection.bullets.length - 1
        var nextBullet = previousCollection.bullets[lastPosition]
        this.moveTo({bullet: nextBullet, collection: previousCollection, event: event})
      } else {
        this.$el.querySelector('div.pagetitle').focus()
        event.preventDefault()
        this.setEndOfContenteditable(this.$el.querySelector('div.pagetitle'))
      }
    },
    moveTo({bullet, collection, event}) {
      this.$nextTick(() => {
        if (event) {
          event.preventDefault()
        }
        var collectionRefs = this.$refs['collection-' + collection.id][0].$refs
        collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.setEndOfContenteditable(
          collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'))
      })
    },
    setEndOfContenteditable(contentEditableElement) {
      var range,selection;
      if(document.createRange)
      {
          range = document.createRange();
          range.selectNodeContents(contentEditableElement);
          range.collapse(false);
          selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
      }
      else if(document.selection)
      {
          range = document.body.createTextRange();
          range.moveToElementText(contentEditableElement);
          range.collapse(false);
          range.select();
      }
    }
  }
})


Vue.component('pagetitle', {
  props: ['title'],
  template: `
    <div
      class="pagetitle"
      contenteditable="true"
      v-text="title"
      @blur="edit"
      @keydown.down="moveToFirstBullet"></div>
  `,
  methods: {
    edit(event) {
      var newTitle = event.target.innerText
      this.$emit('edit-page-title', newTitle)
    },
    moveToFirstBullet(event) {this.$emit('move-to-first-bullet', event)}
  },
})
