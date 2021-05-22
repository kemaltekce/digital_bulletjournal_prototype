Vue.component('page', {
  props: ['title', 'collections'],
  template: `
    <div class="page">
      <pagetitle
        :title="title"
        v-on:edit-page-title="editPageTitle"></pagetitle>
      <div class="collections">
        <collection
          v-for="collection in collections"
          :collection="collection"
          :key="collection.id"
          :ref="'collection-' + collection.id"
          v-on:edit-bullet-text="editBulletText"></collection>
      </div>
    </div>
  `,
  methods: {
    editPageTitle(newTitle) {
      this.$emit('edit-page-title', newTitle)
    },
    editBulletText({collectionID, bulletID, newText}) {
      this.$emit('edit-bullet-text', {collectionID, bulletID, newText})
    },
  }
})


Vue.component('pagetitle', {
  props: ['title'],
  template: `
    <div
      class="pagetitle"
      contenteditable="true"
      v-text="title"
      @blur="edit"></div>
  `,
  methods: {
    edit(event) {
      var newTitle = event.target.innerText
      this.$emit('edit-page-title', newTitle)
    }
  },
})
