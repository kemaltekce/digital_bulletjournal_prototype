Vue.component('page', {
  props: ['title', 'collections', 'styles', 'navarrow'],
  template: `
    <div class="page">
      <pageheader
        :arrow="navarrow"
        v-on:change-pagenav-visibility="changePageNavVisibility"
        v-on:add-collection="addCollection"></pageheader>
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
          v-on:change-bullet-style="changeBulletStyle"
          v-on:move-down="moveDown"
          v-on:move-up="moveUp"
          v-on:add-bullet="addBullet"
          v-on:remove-bullet="removeBullet"
          v-on:remove-bullet-style="removeStyle"
          v-on:remove-collection="removeCollection"
          v-on:add-collection="addCollection"
          v-on:change-pagenav-visibility="changePageNavVisibility"
          v-on:iterate-page="iteratePage"></collection>
      </div>
    </div>
  `,
  methods: {
    changePageNavVisibility() {this.$emit('change-pagenav-visibility')},
    editPageTitle(newTitle) {
      this.$emit('edit-page-title', newTitle)
    },
    iteratePage() {this.$emit('iterate-page')},
    moveToFirstBullet(event) {
      var nextCollection = this.collections[0]
      var nextBullet = nextCollection.bullets[0]
      this.moveTo({bullet: nextBullet, collection: nextCollection, event: event})
    },
    editBulletText({collectionID, bulletID, newText}) {
      this.$emit('edit-bullet-text', {collectionID, bulletID, newText})
    },
    changeBulletStyle({collectionID, bulletID, newStyle}) {
      this.$emit('change-bullet-style', {collectionID, bulletID, newStyle})
    },
    addBullet({currentCollection, currentBullet, currentText}) {
      this.$emit('add-bullet', {currentCollection, currentBullet, currentText})
    },
    removeBullet({currentCollection, currentBullet}) {
      this.$emit('remove-bullet', {currentCollection, currentBullet})
    },
    removeStyle({collectionID, bulletID}) {
      this.$emit('remove-bullet-style', {collectionID, bulletID})
    },
    removeCollection(currentCollection) {
      this.$emit('remove-collection', currentCollection)
    },
    addCollection({currentCollection, currentBullet, place}) {
      // if add collection button is used to add collection we don't have a
      // current collection to use. Just pick first collection as current one.
      if (currentCollection === undefined) {
        currentCollection = this.collections[0]
      }
      this.$emit('add-collection', {currentCollection, currentBullet, place})
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
      // move up to bullet in prior collection or to page title
      if (previousCollection) {
        var lastPosition = previousCollection.bullets.length - 1
        var nextBullet = previousCollection.bullets[lastPosition]
        this.moveTo({bullet: nextBullet, collection: previousCollection, event: event})
      } else {
        var pageTitle = this.$el.querySelector('div.pagetitle')
        pageTitle.focus()
        event.preventDefault()
        this.$root.setEndOfContenteditable(pageTitle, pageTitle.innerText.length)
      }
    },
    moveTo({bullet, collection, event}) {
      this.$nextTick(() => {
        if (event) {
          event.preventDefault()
        }
        var collectionRefs = this.$refs['collection-' + collection.id][0].$refs
        var offset = window.getSelection()['anchorOffset']
        collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.$root.setEndOfContenteditable(
          collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'), offset)
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
      @keydown.down="moveToFirstBullet"
      @keydown.up.prevent
      @keydown.enter.prevent></div>
  `,
  methods: {
    edit(event) {
      var newTitle = event.target.innerText
      this.$emit('edit-page-title', newTitle)
    },
    moveToFirstBullet(event) {this.$emit('move-to-first-bullet', event)}
  },
})


Vue.component('pageheader', {
  props: ['arrow'],
  template: `
    <div class="page-header">
      <div
        class="header-button"
        @click="changePageNavVisibility"><i class="fas" v-bind:class="arrow"></i></div>
      <div class="header-button add-collection-button"
        @click="addCollection"><i class="fas fa-plus"></i></div>
      <div class="header-button as-sidebar-button"><span>as sidebar</span></div>
    </div>
  `,
  methods: {
    changePageNavVisibility() {this.$emit('change-pagenav-visibility')},
    addCollection() {this.$emit('add-collection', {currenCollection: undefined, currentBullet: undefined, place: 0})}
  },
})
