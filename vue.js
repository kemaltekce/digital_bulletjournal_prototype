Vue.component('bullet', {
    props: ['note', 'styles'],
    template: `
    <div class="bullet">
      <div class="bullet-style" v-if="note.style" :id="note.style">
        <span v-html="styles[note.style].content" :class="styles[note.style].style"></span>
        </div>
      <div
        class="bullet-text"
        contenteditable="true"
        v-text="note.text"
        @blur="edit"
        @keydown.enter.prevent="endEdit"
        @keydown.delete="removeBullet"
        @keydown.up="moveUp"
        @keydown.down="moveDown"></div>
    </div>
    `,
    methods: {
      edit(event) {
        var src = event.target.innerText
        this.$emit('edit-bullet', {note: this.note, text: src})
      },
      endEdit(event) {
        var text = event.target.innerText
        if (text.includes("/done")) {
          this.changeStyle(event, this.note, text, "done")
        } else if (text.includes("/todo")) {
          this.changeStyle(event, this.note, text, "todo")
        } else if (text.includes("/empty")) {
          this.changeStyle(event, this.note, text, "empty")
        } else if (text.includes("/note")) {
          this.changeStyle(event, this.note, text, "note")
        } else if (text.includes("/migrate")) {
          this.changeStyle(event, this.note, text, "migrate")
        } else if (text.includes("/future")) {
          this.changeStyle(event, this.note, text, "future")
        } else if (text.includes("/heading")) {
          this.changeStyle(event, this.note, text, "heading")
        } else {
          this.$emit('add-bullet', this.note)
        }
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
      },
      changeStyle(event, note, text, style) {
        var adjusted_text = text.replace("/" + style, '')
        this.$emit('edit-bullet', {note: note, text: adjusted_text})
        event.target.innerText = adjusted_text
        if (style === 'empty') {
          this.$emit('change-style', {note: note, style: undefined})
        } else {
          this.$emit('change-style', {note: note, style: style})
        }
      }
    }
  })
  var app = new Vue({
    el: '#app',
    data: function() {
      return {
        notes: [
          {id: this.uuid(), text: 'I am a note.', position: 1, style: 'todo'},
          {id: this.uuid(), text: 'I am also a note.', position: 2, style: 'done'}
        ],
        styles: {
          todo: {content: '<i class="fas fa-circle"></i>', style: 'bullet-style-todo'},
          done: {content: '<i class="fas fa-times"></i>', style: 'bullet-style-done'},
          empty: {content: '', style: undefined},
          note: {content: '<i class="fas fa-minus"></i>', style: 'bullet-style-note'},
          migrate: {content: '<i class="fas fa-chevron-right"></i>', style: 'bullet-style-migrate'},
          future: {content: '<i class="fas fa-chevron-left"></i>', style: 'bullet-style-future'},
          heading: {content: '', style: undefined}
        }
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
      addBullet(note) {
        var recent_pos = note.position
        this.notes.forEach(function(note) {
          if (note.position > recent_pos) {note.position++}
        })
        var newPos = recent_pos + 1
        var newID = this.uuid()
        var newBullet = {id: newID, text:"", position: newPos, style: note.style}
        this.notes.push(newBullet)
        this.notes.sort((x, y) => (x.position > y.position) ? 1 : -1)
        this.$nextTick(() => {
          this.moveTo(undefined, newBullet)
        })
      },
      changeStyle(args) {
        this.$set(args.note, 'style', args.style)
        this.moveTo(args.event, args.note)
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
            if (event) {
              event.preventDefault()
            }
            this.$refs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text').focus()
            this.setEndOfContenteditable(
              this.$refs['bullet-' + bullet.id][0].$el.querySelector('div.bullet-text'))
          })
        }
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