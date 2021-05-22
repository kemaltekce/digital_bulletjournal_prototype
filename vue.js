var app = new Vue({
  el: '#app',
  data: function() {
    return {
      page: {},
      pages: [
        {
          id: this.uuid(),
          title: 'Monthly Log',
          collections: [
            {
              id: this.uuid(),
              bullets: [
                {id: this.uuid(), text: 'I am a note.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a note.', position: 1, style: 'done'}
              ]
            },
            {
              id: this.uuid(),
              bullets: [
                {id: this.uuid(), text: 'I am a note again.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a note again.', position: 1, style: 'done'}
              ]
            },
          ],
        },
        {
          id: this.uuid(),
          title: 'Weekly Log',
          collections: [
            {
              id: this.uuid(),
              bullets: [
                {id: this.uuid(), text: 'I am a weekly note.', position: 0, style: 'todo'},
                {id: this.uuid(), text: 'I am also a weekly note.', position: 1, style: 'done'}
              ]
            },
            {
              id: this.uuid(),
              bullets: [
                {id: this.uuid(), text: 'I am a weekly note again.', position: 0, style: 'todo'},
              ]
            },
          ],
        },
      ],
    }
  },
  created() {
    this.page = this.pages[0]
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
    editBulletText({collectionID, bulletID, newText}) {
      const isCollection = (element) => element.id === collectionID
      const isBullet = (element) => element.id === bulletID
      const collectionIndex = this.page.collections.findIndex(isCollection)
      const bulletIndex = this.page.collections[collectionIndex].bullets.findIndex(isBullet)
      this.$set(this.page.collections[collectionIndex].bullets[bulletIndex], 'text', newText)
    }
  }
})
