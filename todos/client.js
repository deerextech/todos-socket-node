const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {

    console.warn(event);
    const titleInput = document.getElementById('todo-input');
    // Emit the new todo as some data to the server
    //I changed the name to be more descriptive.
    server.emit('makeTodo', {
        title : titleInput.value,
        completed: false

    }); 

    // Clear the input
    titleInput.value = '';

    // TODO: refocus the element
}

//this update function needs improvement. 
function updateEventListener(){
    var completedTodo = document.getElementById('todo-list')
    completedTodo.addEventListener("click", updateTodo)
   
}
  function updateTodo(e){
        
    var updateCompleted = e.target.parentNode;
    updateCompleted.setAttribute('checked', 'checked');
    updateCompleted.className += 'completed-todo';
    console.log('target', updateCompleted)
    

    var title = updateCompleted.lastChild.innerHTML;

     server.emit('updateTodo',{
            title: title,
            completed: true
        });
   }

function completeAll(){
    var allTodos = document.getElementsByClassName('todo-status');
    for(i=0; i < allTodos.length; i++){
        var todo = allTodos[i];
        todo.setAttribute('checked', 'checked');
        todo.parentNode.setAttribute('class', ' completed-todo')
    }
    server.emit('completeAll',{
        completed:true
    });
}


function render(todo) {
    // this function needs some template help.
    //mustache.js maybe.. 

    //LI tag
    const listItem = document.createElement('li');
    const listItemText = document.createTextNode(todo.title);
    //span for formatting
    const span = document.createElement('span');
   //Input
    var completedStatus = document.createElement('input');
    completedStatus.setAttribute('type', 'checkbox');
    completedStatus.setAttribute('onclick', 'updateEventListener()');
    completedStatus.className = 'todo-status';

    //any todos that are completed will receive special class
    if(todo.completed === true){
         completedStatus.setAttribute('checked', todo.completed);
         listItem.className += ' completed-todo';
    }

    listItem.appendChild(completedStatus);
    listItem.appendChild(span);
    span.appendChild(listItemText);
    list.append(listItem);
}

// NOTE: These are listeners for events from the server
// Adds a single new todo.
server.on('addTodo', (todo)=>{
    render(todo);
})

// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    todos.forEach((todo) => render(todo));
});
