function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] &
        (15 >> (c / 4)))).toString(16)
  );
}

var app = {
  $cell: true,
  id: "app",
  $components: [
    {
      $type: "header",
      $html: "<h1>CellJS ToDo</h1>"
    },
    {
      $type: "section",
      id: "card",
      $components: [
        {
          $type: "input",
          class: "input__text",
          type: "text",
          placeholder: "What needs to be done?",
          $init: function(e) {
            this.focus();
          },
          onkeyup: function(e) {
            if (e.keyCode === 13) {
              document.querySelector("#lists")._add(this.value);
              this.value = "";
            }
          }
        },
        {
          $type: "div",
          id: "lists",
          class: "lists__container",
          _todos: {},
          _todoNum: null,
          _doneNum: null,
          _undoneNum: null,
          $update: function() {
            this._todoNum = Object.keys(this._todos).length;
            this._doneNum = Object.keys(this._todos).filter(id => {
              return this._todos[id].isDone;
            }).length;
            this._undoneNum = Object.keys(this._todos).filter(id => {
              return this._todos[id].isDone === false;
            }).length;

            document.querySelector("#list-todo").$components = showTodos(
              this._todos
            );

            document.querySelector("#footer__active").$update();
            document.querySelector("#footer__completed").$update();
          },
          $components: [
            {
              $type: "div",
              class: "list",
              $components: [
                {
                  $type: "ol",
                  id: "list-todo"
                }
              ]
            }
          ],
          _add: function(val) {
            var id = uuidv4();
            this._todos[id] = {
              text: val,
              isDone: false
            };
          },
          _remove: function(id) {
            delete this._todos[id];
          },
          _toggle: function(id) {
            var item = this._todos[id];
            item.isDone = !item.isDone;
          },
          _clearCompleted: function() {
            var todos = {};
            Object.keys(this._todos).forEach(id => {
              if (this._todos[id].isDone === false && this._todos[id]) {
                todos[id] = this._todos[id];
              }
            });
            this._todos = todos;
            document.querySelector("#footer__completed").$update();
          }
        },
        {
          $type: "footer",
          $components: [
            {
              $type: "div",
              _items: "",
              class: "footer__active",
              id: "footer__active",
              $text: this._items,
              $update: function() {
                var todoNum = document.querySelector("#lists")._todoNum;
                var undoneNum = document.querySelector("#lists")._undoneNum;
                console.log(todoNum);
                if (undoneNum || todoNum) {
                  this.$text = `${undoneNum} ${undoneNum === 1
                    ? "item"
                    : "items"} left`;
                } else {
                  this.$text = "";
                }
              }
            },
            {
              $type: "a",
              _items: 0,
              id: "footer__completed",
              class: "footer__completed",
              onclick: function(e) {
                e.preventDefault();
                document.querySelector("#lists")._clearCompleted();
              },
              $text: "",
              $update: function() {
                var doneNum = document.querySelector("#lists")._doneNum;
                if (doneNum) {
                  this.$text = "Clear Completed";
                } else {
                  this.$text = "";
                }
              }
            }
          ]
        }
      ]
    },
    {
      $type: "div",
      $html: `<p class="p--small p--centered">
          Demo app built by <a href="https://brettdewoody.com">Brett DeWoody</a> using <a href="https://www.celljs.org/">cellJS</a>.
        </p>
        <p class="p--small p--centered">
          Source available on <a href="https://github.com/brettdewoody/celljs-todo-demo">Github</a>.
        </p>`
    }
  ]
};

var listTodoItem = function(item) {
  return {
    $type: "li",
    class: `list__item ${item.data.isDone === true ? " list__item--done" : ""}`,
    id: item.id,
    onclick: function() {
      document.querySelector("#lists")._toggle(this.id);
    },
    $components: [
      {
        $type: "div",
        class: "list__item__text",
        $text: item.data.text
      },
      {
        $type: "a",
        class: "link__delete",
        $html: "&times;",
        onclick: function(e) {
          e.stopPropagation();
          document.querySelector("#lists")._remove(this.parentNode.id);
        }
      }
    ]
  };
};

var showTodos = todos => {
  return Object.keys(todos).map(key => {
    return listTodoItem({ id: key, data: todos[key] });
  });
};
