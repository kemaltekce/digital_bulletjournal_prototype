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
        heading: {content: '', style: undefined}
      },
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
                {id: this.uuid(), text: 'I am also a note.', position: 1, style: 'done'}
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
  },
  updated() {
    this.addDefaultBullet()
  },
  methods: {
    uuid() {
      return Math.random().toString(16).slice(2)},
    focusFirstBullet() {
      var pageRef = this.$refs['page-' + this.page.id].$refs
      var collectionRefs = pageRef['collection-' + this.page.collections[0].id][0].$refs
      collectionRefs['bullet-' + this.page.collections[0].bullets[0].id][0].$el.querySelector('div.bullet-text').focus()
      this.setEndOfContenteditable(collectionRefs['bullet-' + this.page.collections[0].bullets[0].id][0].$el.querySelector('div.bullet-text'))
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
    addNewPage() {
      const newPage = {
        id: this.uuid(),
        title: 'Untitled',
        collections: [
          {
            id: this.uuid(),
            bullets: [
              {id: this.uuid(), text: '', position: 0, style: undefined},
            ]
          }
        ],
      }
      this.pages.push(newPage)
    },
    editBulletText({collectionID, bulletID, newText}) {
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this.page.collections.findIndex(isCollection)
      const bulletIndex = this.page.collections[collectionIndex].bullets.findIndex(isBullet)
      if (bulletIndex !== -1) {
        this.$set(this.page.collections[collectionIndex].bullets[bulletIndex], 'text', newText)
      }
      this.$forceUpdate()
    },
    addBullet({currentCollection, currentBullet, currentText}) {
      var {collectionIndex, bullets} = this.getBullets(currentCollection)

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
      if (previousBullet) {
        this.moveTo({page: this.page, bullet: previousBullet, collection: currentCollection})
      } else {
        this.$nextTick(() => {
          this.moveTo({page: this.page, bullet: this.page.collections[collectionIndex].bullets[0], collection: currentCollection})
        })
      }
    },
    moveTo({page, bullet, collection}) {
      this.$nextTick(() => {
        var collectionRefs = this.$refs['page-' + page.id].$refs['collection-' + collection.id][0].$refs
        collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
        this.setEndOfContenteditable(
          collectionRefs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'))
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
