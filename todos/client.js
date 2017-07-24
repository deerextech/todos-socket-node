const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

var localstorage = window.localStorage;

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {

    console.warn(event);
    const titleInput = document.getElementById('todo-input');
    // Emit the new todo as some data to the server
    //I changed the name to be more descriptive.
    server.emit('makeTodo', {
        id : Math.floor(Math.random() * ((1000-2)+1) + 2),
        title : titleInput.value,
        completed: false

    }); 

    // Clear the input
    titleInput.value = '';
}

//complete single todo
//uses random generated id to target input that was checked
function completeTodo(id){

    var selectedTodo = document.getElementById(id);
    var todoTitle = selectedTodo.parentNode.parentNode.children[1].innerHTML.trim();

   var checked = selectedTodo.setAttribute('checked', true);

    var selectedTodoId = selectedTodo.parentNode.parentNode.children[1].getAttribute('id');
  
    //this will overwrite existing stored value (because IDs match)
    var localTodo = {
        id:selectedTodoId,
        title:todoTitle,
        completed:true
    };
    //set completed to true.
    localstorage.setItem(selectedTodoId, JSON.stringify(localTodo));
    console.log('local storage', localstorage);

         server.emit('updateTodo', {
                title: todoTitle,
                completed: true
            });

    selectedTodo.parentNode.parentNode.setAttribute('class', ' completed-todo')
  

}

function completeAll(){
    var allTodos = document.getElementsByClassName('todo-status');
    for(i=0; i < allTodos.length; i++){
        var todo = allTodos[i];
        todo.setAttribute('checked', 'checked');
        todo.parentNode.parentNode.setAttribute('class', ' completed-todo')
    }
    server.emit('completeAll',{
        completed:true
    });
}

function remove(id){

    var selectedTodo = document.getElementById(id);
    var selectedTodoID = selectedTodo.id;
  

     server.emit('removeTodo', {
            title: selectedTodo.innerHTML.trim()
        });

    localstorage.removeItem(selectedTodoID);
    selectedTodo.parentNode.remove();
}

function removeAllTodos(){
    server.emit('removeAllTodos');
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    localstorage.clear();

    console.log('localstorage', localstorage);

}


function render(todo) {

    var listItem = document.getElementsByClassName('todo-list-items');
    var template = jQuery('#todo-list-template').html();



    var html = Mustache.render(template, {
        inputId:Math.floor(Math.random() * ((1000-2)+1) + 2),
        divId: todo.id, //generates random Id number.
        title: todo.title,
        completedClass: todo.completed ? 'completed-todo': ''
    });

   
    jQuery('#todo-list').append(html);

}


server.on('addTodo', (todo)=>{

    var newTodoId = todo.id;
    //adds item to local storage
    localstorage.setItem(newTodoId, JSON.stringify(todo));
    //adds item to list
    render(todo);
});

// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    
  //whatever is in local storage will get loaded.
    if(localstorage.length !== 0 ){

        for(var i = 0; i < localstorage.length; i++){
            var keys = Object.keys(localStorage);
            var storedTodos = JSON.parse(localStorage.getItem(keys[i]));
            render(storedTodos);
        }
    }
    //if local storage is empty, load list
    if(localstorage.length === 0){

         todos.forEach((todo) => {
            localstorage.setItem(todo.id, JSON.stringify(todo));
            render(todo);
         })
    }
});
