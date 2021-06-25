var app = new Vue({
  el: '#app',
  data: function() {
    return {
      page: {},
      styles: {
        todo: {content: '<i class="fas fa-circle"></i>', style: 'bullet-style-todo'},
        done: {content: '<i class="fas fa-times"></i>', style: 'bullet-style-done'},
        empty: {content: '', style: undefined},
        note: {content: '<i class="fas fa-minus"></i>', style: 'bullet-style-note'},
        migrate: {content: '<i class="fas fa-chevron-right"></i>', style: 'bullet-style-migrate'},
        future: {content: '<i class="fas fa-chevron-left"></i>', style: 'bullet-style-future'},
        heading: {content: '', style: undefined},
        tab: {content: '', style: 'bullet-style-tab'}
      },
      displayNav: true,
      navarrow: 'fa-angle-double-left',
      pages: [
        {
          id: this.uuid(),
          title: '🍉 Monthly Log',
          collections: [
            {
              id: this.uuid(),
              position: 0,
              bullets: [
                {id: this.uuid(), text: 'I am a note.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a note.', position: 1, style: 'done'},
                {id: this.uuid(), text: 'I am also a note.', position: 2, style: 'tab'},
                {id: this.uuid(), text: 'I am also a note.', position: 3, style: 'done'},
                {id: this.uuid(), text: 'I am also a note.', position: 4, style: undefined},
                {id: this.uuid(), text: 'I am also a note.', position: 5, style: 'heading'},
                {id: this.uuid(), text: 'I am also a note.', position: 6, style: 'todo'},
                {id: this.uuid(), text: 'I am also a note.', position: 7, style: 'tab'},
              ]
            },
            {
              id: this.uuid(),
              position: 1,
              bullets: [
                {id: this.uuid(), text: 'I am a note again.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a note again.', position: 1, style: 'done'}
              ]
            },
          ],
        },
        {
          id: this.uuid(),
          title: '🎒 Weekly Log',
          collections: [
            {
              id: this.uuid(),
              position: 0,
              bullets: [
                {id: this.uuid(), text: 'I am a weekly note.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a weekly note.', position: 1, style: 'done'}
              ]
            },
            {
              id: this.uuid(),
              position: 1,
              bullets: [
                {id: this.uuid(), text: 'I am a weekly note again.', position: 0, style: 'note'},
              ]
            },
          ],
        },
      ],
    }
  },
  created() {
    this.page = this.pages[0]
    this.addDefaultBullet()
  },
  mounted() {
    this.focusFirstBullet()
    this.setBulletTabColor()
  },
  updated() {
    this.addDefaultBullet()
    this.setBulletTabColor()
  },
  methods: {
    uuid() {
      return Math.random().toString(16).slice(2)},
    focusFirstBullet() {
      // after loading page. Be ready to edit text. No extra click needed.
      var pageRef = this.$refs['page-' + this.page.id].$refs
      var collectionRefs = pageRef['collection-' + this.page.collections[0].id][0].$refs
      collectionRefs['bullet-' + this.page.collections[0].bullets[0].id][0].$el.querySelector('div.bullet-text').focus()
      var firstBullet = collectionRefs['bullet-' + this.page.collections[0].bullets[0].id][0].$el.querySelector('div.bullet-text')
      this.setEndOfContenteditable(firstBullet, firstBullet.innerText.length)
    },
    setBulletTabColor() {
      // first remove all inline styles
      document.querySelectorAll('.bullet').forEach(function(div) {
        div.querySelector('.bullet-text').style.color = ''
      })
      // add inline style for tab bullets based on sibiling style
      document.querySelectorAll('#tab').forEach(function(div) {
        var previousColor = window.getComputedStyle(div.previousSibling.querySelector('.bullet-text')).color
        div.querySelector('.bullet-text').style.color = previousColor
      })
    },
    editPageTitle(newTitle) {
      this.$set(this.page, 'title', newTitle)
    },
    loadPage(id) {
      const isID = (element) => element.id === id
      this.page = this.pages[this.pages.findIndex(isID)]
      this.$nextTick(() => {
        this.focusFirstBullet()
      })
    },
    iteratePage(id) {
      const isID = (element) => element.id === id
      var nextIndex = this.pages.findIndex(isID) + 1
      if (nextIndex >= this.pages.length) {
        nextIndex = 0
      }
      var nextPageID = this.pages[nextIndex].id
      this.loadPage(nextPageID)
    },
    addNewPage() {
      const newPage = {
        id: this.uuid(),
        title: 'Untitled',
        collections: [
          {
            id: this.uuid(),
            bullets: [
              {id: this.uuid(), text: '', position: 0, style: undefined},
            ],
            position: 0,
          }
        ],
      }
      this.pages.push(newPage)
    },
    changePageNavVisibility() {
      this.displayNav = !this.displayNav
      if (this.displayNav) {
        this.navarrow = 'fa-angle-double-left'
      } else {
        this.navarrow = 'fa-angle-double-right'
      }
    },
    removeCollection(currentCollection) {
      if (this.page.collections.length !== 1) {
        var collections = this.page.collections

        var deleteIndex = (collection) => collection.id === currentCollection.id
        var deleteCollectionIndex = collections.findIndex(deleteIndex)
        collections.splice(deleteCollectionIndex, 1)
        collections.forEach(function(collection) {
          if (collection.position > currentCollection.position) {collection.position--}
        })
        this.$set(this.page, 'collections', collections)
        // focus on previsous or next collection
        if (deleteCollectionIndex === 0) {
          this.moveTo({page: this.page, bullet: this.page.collections[0].bullets[0], collection: this.page.collections[0]})
        } else {
          var previousCollection = this.page.collections[deleteCollectionIndex - 1]
          var lastBulletIndex = previousCollection.bullets.length -1
          this.moveTo({page: this.page, bullet: previousCollection.bullets[lastBulletIndex], collection: previousCollection})
        }
      }
    },
    addCollection({currentCollection, currentBullet, place}) {
      var newCollectionPosition = currentCollection.position + place
      var collections = this.page.collections
      collections.forEach(function(collection) {
        if (collection.position >= newCollectionPosition) {collection.position++}
      })

      var newID = this.uuid()
      var newCollection = {id: newID, text:"", position: newCollectionPosition, bullets: []}
      collections.push(newCollection)
      collections.sort((x, y) => (x.position > y.position) ? 1 : -1)

      this.$set(this.page, 'collections', collections)
      if (currentBullet !== undefined) {
        this.moveTo({page: this.page, bullet: currentBullet, collection: currentCollection})
      }
    },
    editBullet({collectionID, bulletID, key, value}) {
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this.page.collections.findIndex(isCollection)
      // collection index may not exist after removing collection
      if (collectionIndex !== -1) {
        const bulletIndex = this.page.collections[collectionIndex].bullets.findIndex(isBullet)
        // bullet may not exist after remove bullet action
        if (bulletIndex !== -1) {
          this.$set(this.page.collections[collectionIndex].bullets[bulletIndex], key, value)
        }
      }
      // setting bullet text doesn't trigger an update
      this.$forceUpdate()
    },
    editBulletText({collectionID, bulletID, newText}) {
      this.editBullet({collectionID, bulletID, key: 'text', value: newText})
    },
    changeBulletStyle({collectionID, bulletID, newStyle}) {
      this.editBullet({collectionID, bulletID, key: 'style', value: newStyle})
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this.page.collections.findIndex(isCollection)
      const bulletIndex = this.page.collections[collectionIndex].bullets.findIndex(isBullet)
      var collection = this.page.collections[collectionIndex]
      var bullet = collection.bullets[bulletIndex]
      this.moveTo({page: this.page, bullet: bullet, collection: collection})
    },
    removeStyle({collectionID, bulletID}) {
      this.editBullet({collectionID, bulletID, key: 'style', value: undefined})
    },
    addBullet({currentCollection, currentBullet, currentText}) {
      var {collectionIndex, bullets} = this.getBullets(currentCollection)

      // distinguish between create a bullet above or below current bullet
      var currentPosition = currentBullet.position
      if (window.getSelection()['anchorOffset'] === 0 && (currentBullet.text.length !== 0 || currentText.length !== 0)) {
        bullets.forEach(function(bullet) {
          if (bullet.position >= currentPosition) {bullet.position++}
        })
        var newPos = currentPosition
      } else {
        bullets.forEach(function(bullet) {
          if (bullet.position > currentPosition) {bullet.position++}
        })
        var newPos = currentPosition + 1
      }
      var newID = this.uuid()
      var newBullet = {id: newID, text:"", position: newPos, style: currentBullet.style}
      bullets.push(newBullet)
      bullets.sort((x, y) => (x.position > y.position) ? 1 : -1)

      this.$set(this.page.collections[collectionIndex], 'bullets', bullets)
      this.moveTo({page: this.page, bullet: newBullet, collection: currentCollection})
    },
    removeBullet({currentCollection, currentBullet}) {
      var {collectionIndex, bullets} = this.getBullets(currentCollection)

      var isBullet = (element) => element.id === currentBullet.id
      var bulletIndex = this.page.collections[collectionIndex].bullets.findIndex(isBullet)
      var previousBullet = this.page.collections[collectionIndex].bullets[bulletIndex - 1]

      var deleteIndex = (bullet) => bullet.id === currentBullet.id
      bullets.splice(bullets.findIndex(deleteIndex), 1)
      bullets.forEach(function(bullet) {
        if (bullet.position > currentBullet.position) {bullet.position--}
      })

      this.$set(this.page.collections[collectionIndex], 'bullets', bullets)
      // previous bullet may not exist if we deleted the last bullet in the
      // collection. Wait for the next tick to create a new empty bullet and
      // move to that new bullet.
      if (previousBullet) {
        this.moveTo({page: this.page, bullet: previousBullet, collection: currentCollection, offset: previousBullet.text.length})
      } else {
        this.$nextTick(() => {
          this.moveTo({page: this.page, bullet: this.page.collections[collectionIndex].bullets[0], collection: currentCollection})
        })
      }
    },
    moveTo({page, bullet, collection, offset=window.getSelection()['anchorOffset']}) {
      this.$nextTick(() => {
        var collectionRefs = this.$refs['page-' + page.id].$refs['collection-' + collection.id][0].$refs
        collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.setEndOfContenteditable(
          collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'), offset)
      })
    },
    getBullets(collection) {
      var isCollection = (element) => element.id === collection.id
      var collectionIndex = this.page.collections.findIndex(isCollection)
      var bullets = this.page.collections[collectionIndex].bullets
      return {collectionIndex, bullets}
    },
    addDefaultBullet() {
      this.page.collections.forEach(collection => {
        var lastBullet = collection.bullets[collection.bullets.length - 1]
        if (lastBullet === undefined) {
          collection.bullets.push({id: this.uuid(), text:"", position: 0, style: undefined})
        } else if (lastBullet.text !== '') {
          collection.bullets.push(
            {id: this.uuid(), text:"", position: lastBullet.position + 1, style: undefined})
        }
      })
    },
    setEndOfContenteditable(contentEditableElement, offset) {
      var range,selection;
      if(document.createRange)
      {
          range = document.createRange();
          if ((contentEditableElement.childNodes[0] === undefined) || (offset === undefined)) {
            // use this if bullet is empty. If bullet is empty childNotes do
            // not exist.
            range.selectNodeContents(contentEditableElement);
          } else if (offset > contentEditableElement.innerText.length) {
            range.setStart(contentEditableElement.childNodes[0], contentEditableElement.innerText.length)
          }else {
            range.setStart(contentEditableElement.childNodes[0], offset)
          }
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
    },
  }
})
