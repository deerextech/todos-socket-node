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
//uses random generated id to target todo that was selected
function completeTodo(id){

    var selectedTodo = document.getElementById(id);
    var title = selectedTodo.innerHTML.trim();
    
    //this will overwrite existing stored value (because IDs match)
    var localTodo = {
        id: selectedTodo.id,
        title: title,
        completed:true
    };

    //set completed to true.
    localstorage.setItem(id, JSON.stringify(localTodo));
         server.emit('updateTodo', {
                title: title,
                completed: true
            });

    //add class to mark it as finished.     
    selectedTodo.className +=  ' completed-todo';

}

function completeAll(){
    var allTodos = document.getElementsByClassName('todo-list-item');
    for(i=0; i < allTodos.length; i++){
        var todo = allTodos[i];
        var id = todo.id;

        localTodos = {
            id:id,
            title: todo.innerHTML.trim(),
            completed:true
        }

        //overwrites localstorage with updated complete status
        localstorage.setItem(id, JSON.stringify(localTodos));
        todo.className +=  ' completed-todo';
        // console.log('todo?', todo)

    }
    //update fake DB
    server.emit('completeAll',{
        completed:true
    });
}

//remove single by ID
function remove(id){

    var selectedTodo = document.getElementById(id);
    var selectedTodoID = selectedTodo.parentNode.parentNode.children[1].getAttribute('id');
    var title = selectedTodo.parentNode.parentNode.children[1].innerHTML.trim();

     server.emit('removeTodo', {
            title: title
        });

    localstorage.removeItem(selectedTodoID);
    selectedTodo.parentNode.parentNode.remove();
}

//Remove all.
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


    //template for list items
    var html = Mustache.render(template, {
        buttonId: Math.floor(Math.random() * ((1000-2)+1) + 2), //generates random Id number.
        divId: todo.id, 
        title: todo.title,
        completedClass: todo.completed ? 'completed-todo': ''
    });

    //appends template to <ul todo-list-items>   
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
