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
    var getTitle = selectedTodo.parentNode.parentNode.children[1].innerHTML.trim();

    var checked = selectedTodo.getAttribute('checked');

         server.emit('updateTodo', {
                title: getTitle,
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
        completed: todo.completed
    });

    ///NEED TO FIX CONDITION FOR : 
    //setting line-through class to elements that have todos that are already completed
    
    // if(todo.completed === true){

    //     // console.log('jfdkas;s', jQuery('#todo-list-template'));
    //     // console.log('what tods in hur', todo.parentNode);
    //     // console.log('div maybe', divId);
    //     // listItem.setAttribute('class', 'completed-todo');
    //      jQuery('.todo-list-items').attr('class', 'completed-todo'); 
    //     // template.setAttribute('class', 'completed-todo');
    //     // listItem.className += ' completed-todo';
    //       var listItem = 
    //      $('.todo-status').attr('checked', todo.completed);
    //      $('todo-list-items').className += ' completed-todo';
    // }

    jQuery('#todo-list').append(html);

}


server.on('addTodo', (todo)=>{

    var newTodoId = todo.id;

    localstorage.setItem(newTodoId, JSON.stringify(todo));

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
    if(localstorage.length === 0){

         todos.forEach((todo) => {
            localstorage.setItem(todo.id, JSON.stringify(todo));
            render(todo);
         })
    }
});
