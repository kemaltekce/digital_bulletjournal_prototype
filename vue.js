Vue.component('bullet', {
    props: ['note'],
    template: `
      <div
        class="bullet-text"
        contenteditable="true"
        v-text="note.text"
        @blur="edit"
        @keydown.enter.prevent="endEdit"
        @keydown.delete="removeBullet"
        @keydown.up="moveUp"
        @keydown.down="moveDown"></div>
    `,
    methods: {
      edit(event) {
        var src = event.target.innerText
        // this.note.text = src
        // this.$set(this.note, 'text', src)
        this.$emit('edit-bullet', {note: this.note, text: src})
      },
      endEdit(event) {
        this.$emit('add-bullet', this.note.position)
      },
      removeBullet(event) {
        if (event.target.innerText.length === 0) {
          this.$emit(
            'remove-bullet',
            {id: this.note.id, pos: this.note.position, event: event})
        }
      },
      moveUp(event) {
        this.$emit(
          'move-up', {id: this.note.id, pos: this.note.position, event: event})
      },
      moveDown(event) {
        this.$emit(
          'move-down', {id: this.note.id, pos: this.note.position, event: event})
      }
    }
  })

  var app = new Vue({
    el: '#app',
    data: function() {
      return {
        notes: [
          {id: this.uuid(), text: 'I am a note.', position: 1},
          {id: this.uuid(), text: 'I am also a note.', position: 2}
        ]
      }
    },
    updated: function () {
      this.addDefaultBullet()
    },
    created: function () {
      this.addDefaultBullet()
    },
    methods: {
      uuid() {
        return Math.random().toString(16).slice(2)
      },
      addDefaultBullet() {
        var lastBullet = this.notes[this.notes.length - 1]
        if (lastBullet === undefined) {
          this.notes.push({id: this.uuid(), text:"", position: 1})
        } else if (lastBullet.text !== '') {
          this.notes.push(
            {id: this.uuid(), text:"", position: lastBullet.position + 1})
        }
      },
      editBullet(info){
        this.$set(info.note, 'text', info.text)
        this.$forceUpdate()
      },
      addBullet(recent_pos) {
        this.notes.forEach(function(note) {
          if (note.position > recent_pos) {note.position++}
        })
        var newPos = recent_pos + 1
        var newID = this.uuid()
        this.notes.push({id: newID, text:"", position: newPos})
        this.notes.sort((x, y) => (x.position > y.position) ? 1 : -1)
        this.$nextTick(() => {
          var newBullet = this.$refs['bullet-' + newID]
          newBullet[0].$el.focus()
        })
      },
      removeBullet(args) {
        var deleteID = args.id
        var deletePos = args.pos
        this.notes = this.notes.filter(note => note.id !== deleteID)
        this.notes.forEach(function(note) {
          if (note.position > deletePos) {note.position--}
        })
        var previousBullet = this.notes.filter(
          note => note.position === deletePos - 1)[0]
        this.moveTo(args.event, previousBullet)
      },
      moveUp(args) {
        var recent_pos = args.pos
        var previousBullet = this.notes.filter(
          note => note.position === recent_pos - 1)[0]
        this.moveTo(args.event, previousBullet)
      },
      moveDown(args) {
        var recent_pos = args.pos
        var nextBullet = this.notes.filter(
          note => note.position === recent_pos + 1)[0]
        this.moveTo(args.event, nextBullet)
      },
      moveTo(event, bullet) {
        if (bullet) {
          this.$nextTick(() => {
            event.preventDefault()
            this.$refs['bullet-' + bullet.id][0].$el.focus()
            this.setEndOfContenteditable(
              this.$refs['bullet-' + bullet.id][0].$el)
          })
        }
      },
      setEndOfContenteditable(contentEditableElement) {
        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        {
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
      }
    }
  })