const server = require('socket.io')();
const firstTodos = require('./data');
const Todo = require('./todo');

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    const DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title, completed=t.completed);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    }

    //made this to take care of adding a single todo
    // gets rid of re-rendering entire list again.
    const addTodo = (todo) =>{
        server.emit('addTodo', todo);
    }


    // Accepts when a client makes a new todo
    client.on('makeTodo', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

     // Send the latest todo to the client
        addTodo(newTodo);
    });

    //updates selected todo
    client.on('updateTodo', (updatedTodo)=>{
           DB.forEach((todo) => {
             if (todo.title == updatedTodo.title) {
                   todo.completed = updatedTodo.completed
            }
        });
    });
    //updates all todos
    client.on('completeAll', ()=>{
        //for each, set completed to true
        DB.forEach((todo) => {
            todo.completed = true;

        });
    })


    // Send the DB downstream on connect
    reloadTodos();
});



console.log('Waiting for clients to connect');
server.listen(3003);
