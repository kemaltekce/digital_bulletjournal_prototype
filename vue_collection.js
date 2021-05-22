Vue.component('collection', {
  props: ['collection'],
  template: `
    <div class="collection">
      <bullet
        v-for="bullet in collection.bullets"
        :bullet="bullet"
        :key="bullet.id"
        :ref="'bullet-' + bullet.id"
        v-on:edit-bullet-text="editBulletText"></bullet>
    </div>
  `,
  methods: {
    editBulletText({id, newText}) {
      this.$emit(
        'edit-bullet-text',
        {collectionID: this.collection.id, bulletID: id, newText: newText})
    },
  },
})
