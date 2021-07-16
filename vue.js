var app = new Vue({
  el: '#app',
  data: function() {
    return {
      mobileVersion: false,
      page: {},
      sidepage: {},
      sidepagewidth: 0,
      sidepageMobileActive: false,
      styles: {
        todo: {content: '<i class="fas fa-circle"></i>', style: 'bullet-style-todo'},
        done: {content: '<i class="fas fa-times"></i>', style: 'bullet-style-done'},
        empty: {content: '', style: undefined},
        note: {content: '<i class="fas fa-minus"></i>', style: 'bullet-style-note'},
        migrate: {content: '<i class="fas fa-chevron-right"></i>', style: 'bullet-style-migrate'},
        future: {content: '<i class="fas fa-chevron-left"></i>', style: 'bullet-style-future'},
        h1: {content: '', style: undefined},
        h2: {content: '', style: undefined},
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
                {id: this.uuid(), text: 'I am also a note.', position: 5, style: 'h1'},
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
    this.addDefaultBullet(this.page)
    if (this.sidepage.id !== undefined) {
      this.addDefaultBullet(this.sidepage)
    }
    window.addEventListener("resize", this.adjustPageWidth);
    this.getNavArrow()
  },
  destroyed() {
    window.removeEventListener("resize", this.adjustPageWidth);
  },
  mounted() {
    this.focusFirstBullet()
    this.setBulletTabColor()
    this.adjustPageWidth()
  },
  updated() {
    this.addDefaultBullet(this.page)
    if (this.sidepage.id !== undefined) {
      this.addDefaultBullet(this.sidepage)
    }
    this.setBulletTabColor()
    this.adjustPageWidth()
  },
  methods: {
    swipeNavOrSidepage(event) {
      if (this.mobileVersion === true) {
        if (event === 'right' && this.displayNav === false && this.sidepageMobileActive === false) {
          this.changePageNavVisibility()
        } else if (event === 'left' && this.displayNav === true) {
          this.changePageNavVisibility()
        } else if (event === 'left' && this.displayNav === false && this.sidepage.id !== undefined) {
          this.sidepageMobileActive = true
        } else if (event === 'right' && this.displayNav === false && this.sidepageMobileActive === true) {
          this.sidepageMobileActive = false
        }
      }
    },
    uuid() {
      return Math.random().toString(16).slice(2)},
    adjustPageWidth() {
      // adjust size of page and sidepage
      if (this.sidepage.id !== undefined) {
        this.sidepagewidth = document.querySelector('.page').offsetWidth
      } else (
        this.sidepagewidth = document.querySelector('.page').offsetWidth / 2
      )
      // check if mobile version on or off
      var mobileVersionState = this.mobileVersion
      if (window.outerWidth < 700) {
        if (mobileVersionState === false && this.displayNav === true) {
          this.changePageNavVisibility()
        }
        this.$nextTick(() => {
          this.mobileVersion = true
        })
      } else {
        this.mobileVersion = false
      }
    },
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
    editPageTitle({pagetype, newTitle}) {
      this.$set(this[pagetype], 'title', newTitle)
    },
    loadPage(id) {
      const isID = (element) => element.id === id
      this.page = this.pages[this.pages.findIndex(isID)]
      // close navigation after selecting and loading new page in mobile Version
      if (this.mobileVersion === true) {
        this.displayNav = false
      }
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
    asSidebar() {
      this.sidepage = this.page
    },
    closeSidebar() {
      this.sidepage = {}
      if (this.mobileVersion === true) {
        this.sidepageMobileActive = false
      }
    },
    getNavArrow() {
      if (this.displayNav) {
        this.navarrow = 'fa-angle-double-left'
      } else {
        this.navarrow = 'fa-angle-double-right'
      }
    },
    changePageNavVisibility() {
      this.displayNav = !this.displayNav
      this.getNavArrow()
      this.$nextTick(() => {
        this.adjustPageWidth()
      })
    },
    removeCollection({pagetype, currentCollection}) {
      if (this[pagetype].collections.length !== 1) {
        var collections = this[pagetype].collections

        var deleteIndex = (collection) => collection.id === currentCollection.id
        var deleteCollectionIndex = collections.findIndex(deleteIndex)
        collections.splice(deleteCollectionIndex, 1)
        collections.forEach(function(collection) {
          if (collection.position > currentCollection.position) {collection.position--}
        })
        this.$set(this[pagetype], 'collections', collections)
        // focus on previsous or next collection
        if (deleteCollectionIndex === 0) {
          this.moveTo({page: pagetype, bullet: this[pagetype].collections[0].bullets[0], collection: this[pagetype].collections[0]})
        } else {
          var previousCollection = this[pagetype].collections[deleteCollectionIndex - 1]
          var lastBulletIndex = previousCollection.bullets.length -1
          this.moveTo({page: pagetype, bullet: previousCollection.bullets[lastBulletIndex], collection: previousCollection})
        }
      }
    },
    addCollection({pagetype, currentCollection, currentBullet, place}) {
      var newCollectionPosition = currentCollection.position + place
      var collections = this[pagetype].collections
      collections.forEach(function(collection) {
        if (collection.position >= newCollectionPosition) {collection.position++}
      })

      var newID = this.uuid()
      var newCollection = {id: newID, text:"", position: newCollectionPosition, bullets: []}
      collections.push(newCollection)
      collections.sort((x, y) => (x.position > y.position) ? 1 : -1)

      this.$set(this[pagetype], 'collections', collections)
      if (currentBullet !== undefined) {
        this.moveTo({page: pagetype, bullet: currentBullet, collection: currentCollection})
      }
    },
    editBullet({pagetype, collectionID, bulletID, key, value}) {
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this[pagetype].collections.findIndex(isCollection)
      // collection index may not exist after removing collection
      if (collectionIndex !== -1) {
        const bulletIndex = this[pagetype].collections[collectionIndex].bullets.findIndex(isBullet)
        // bullet may not exist after remove bullet action
        if (bulletIndex !== -1) {
          this.$set(this[pagetype].collections[collectionIndex].bullets[bulletIndex], key, value)
        }
      }
      // setting bullet text doesn't trigger an update
      this.$forceUpdate()
    },
    editBulletText({pagetype, collectionID, bulletID, newText}) {
      this.editBullet({pagetype, collectionID, bulletID, key: 'text', value: newText})
    },
    changeBulletStyle({pagetype, collectionID, bulletID, newStyle}) {
      this.editBullet({pagetype, collectionID, bulletID, key: 'style', value: newStyle})
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this[pagetype].collections.findIndex(isCollection)
      const bulletIndex = this[pagetype].collections[collectionIndex].bullets.findIndex(isBullet)
      var collection = this[pagetype].collections[collectionIndex]
      var bullet = collection.bullets[bulletIndex]
      this.moveTo({page: pagetype, bullet: bullet, collection: collection})
    },
    removeStyle({pagetype, collectionID, bulletID}) {
      this.editBullet({pagetype, collectionID, bulletID, key: 'style', value: undefined})
    },
    addBullet({pagetype, currentCollection, currentBullet, currentText}) {
      var {collectionIndex, bullets} = this.getBullets(pagetype, currentCollection)

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

      this.$set(this[pagetype].collections[collectionIndex], 'bullets', bullets)
      this.moveTo({page: pagetype, bullet: newBullet, collection: currentCollection})
    },
    removeBullet({pagetype, currentCollection, currentBullet}) {
      var {collectionIndex, bullets} = this.getBullets(pagetype, currentCollection)

      var isBullet = (element) => element.id === currentBullet.id
      var bulletIndex = this[pagetype].collections[collectionIndex].bullets.findIndex(isBullet)
      var previousBullet = this[pagetype].collections[collectionIndex].bullets[bulletIndex - 1]

      var deleteIndex = (bullet) => bullet.id === currentBullet.id
      bullets.splice(bullets.findIndex(deleteIndex), 1)
      bullets.forEach(function(bullet) {
        if (bullet.position > currentBullet.position) {bullet.position--}
      })

      this.$set(this[pagetype].collections[collectionIndex], 'bullets', bullets)
      // previous bullet may not exist if we deleted the last bullet in the
      // collection. Wait for the next tick to create a new empty bullet and
      // move to that new bullet.
      if (previousBullet) {
        this.moveTo({page: pagetype, bullet: previousBullet, collection: currentCollection, offset: previousBullet.text.length})
      } else {
        this.$nextTick(() => {
          this.moveTo({page: pagetype, bullet: this[pagetype].collections[collectionIndex].bullets[0], collection: currentCollection})
        })
      }
    },
    moveTo({page, bullet, collection, offset=window.getSelection()['anchorOffset']}) {
      this.$nextTick(() => {
        var collectionRefs = this.$refs[page + '-' + this[page].id].$refs['collection-' + collection.id][0].$refs
        collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.setEndOfContenteditable(
          collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'), offset)
      })
    },
    getBullets(pagetype, collection) {
      var isCollection = (element) => element.id === collection.id
      var collectionIndex = this[pagetype].collections.findIndex(isCollection)
      var bullets = this[pagetype].collections[collectionIndex].bullets
      return {collectionIndex, bullets}
    },
    addDefaultBullet(page) {
      page.collections.forEach(collection => {
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
