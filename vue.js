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
  updated() {
    this.addDefaultBullet()
  },
  methods: {
    uuid() {
      return Math.random().toString(16).slice(2)},
    editPageTitle(newTitle) {
      this.$set(this.page, 'title', newTitle)
    },
    loadPage(id) {
      const isID = (element) => element.id === id
      this.page = this.pages[this.pages.findIndex(isID)]
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
      this.$set(this.page.collections[collectionIndex].bullets[bulletIndex], 'text', newText)
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
    }
  }
})
