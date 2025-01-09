import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
// src/index.js or src/App.js
//import 'bootstrap/dist/css/bootstrap.min.css';
//import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//import logo from './assets/white-logo.png';
type Todo = Schema['Todo']['type'];
type UserTodo = Schema['UserTodo']['type'];
import './App.css';
//import Navbar from './components/Navbar/Navbar';
import AOS from 'aos';
// import Logo from './components/Logo/Logo';
// import Header from './components/Header/Header';
// import Banner from './components/Banner/Banner';
// import Gallery from './components/Gallery/Gallery';
const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [usertodos, setUserTodos] = useState<UserTodo[]>([]);
  const { user, signOut } = useAuthenticator();
  const [selectedTodos, setSelectedTodos] = useState<UserTodo[]>([]); // Store the selected (clicked) todos
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: 'ease-in-sine',
      delay: 100,
    });
    AOS.refresh();
  }, []);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        setTodos([...items]);
        console.log('this is isSynced', isSynced);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = client.models.UserTodo.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        setSelectedTodos([...items]);
        console.log('this is isSynced', isSynced);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Fetched todos:', todos);
      console.log('User:', user);
    }
  }, [todos, user]);

  const createTodo = async () => {
    const content = window.prompt('Enter todo content:');
    if (!content) {
      alert('Todo content cannot be empty.');
      return;
    }
    try {
      await client.models.UserTodo.create(
        {
          content,
          isDone: false,
          owner: user.username,
        },
        {
          authMode: 'userPool',
        }
      );

      alert('Todo created successfully!');
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo.');
    }

    try {
      await client.models.Todo.create(
        {
          content,
          isDone: false,
        },
        {
          authMode: 'userPool',
        }
      );

      alert('Todo created successfully!');
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo.');
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, errors } = await client.models.UserTodo.list({
          filter: { owner: { eq: user.username } },
        });

        if (errors) {
          console.error('Error fetching todos:', errors);
          return;
        }

        setUserTodos(data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    if (user) {
      fetchTodos();
    }
  }, [user]);

  const deleteTodo = async (id: string) => {
    try {
      const todoupDelete: { id: string } = {
        id,
      };
      await client.models.Todo.delete(todoupDelete); // Use the ID of the todo to delete

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      alert('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete the todo.');
    }
  };
  const deleteTodoUser = async (id: string) => {
    try {
      const todoupDelete2: { id: string } = {
        id,
      };
      await client.models.UserTodo.delete(todoupDelete2); // Use the ID of the todo to delete
      // After successful deletion, update the state to remove the deleted todo
      setUserTodos((prevTodos) =>
        prevTodos.filter((todouser) => todouser.id !== id)
      );
      alert('Todo deleted successfully User!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete the todo.');
    }
  };

  const handleTodoClick = async (todo: {
    id: string;
    content?: string | null;
    isDone?: boolean | null;
    owner?: string | null;
  }) => {
    // Ensure content and owner are defined before proceeding
    if (!todo.content || !todo.owner) {
      console.error('Invalid todo data:', todo);
      return;
    }

    try {
      // Proceed with API call and posting
      const newTodoResponse = await client.models.UserTodo.create({
        content: todo.content,
        isDone: todo.isDone || false, // Default to false if isDone is undefined or null
        owner: todo.owner,
      });

      // Extract the newTodo from the response, assuming the actual todo is in `newTodoResponse.data`
      const newTodo = newTodoResponse.data;

      if (newTodo) {
        // Add the newTodo to the selectedTodos array
        setSelectedTodos((prevSelected) => [...prevSelected, newTodo]);
      }
    } catch (error) {
      console.error('Error posting todo:', error);
    }
  };

  return (
    <div className="container">
      <div className="column todos-column">
        <h1>My todos</h1>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.content}
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              <button onClick={() => handleTodoClick(todo)}>add</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="column blank-column">
        {usertodos.map((todouser) => (
          <li key={todouser.id}>
            {todouser.content}
            <button onClick={() => deleteTodoUser(todouser.id)}>Delete</button>
          </li>
        ))}
        <button onClick={createTodo}>+ new</button>
        <h1>Selected Todos</h1>
        <ul>
          {selectedTodos.map((todo, index) => (
            <li key={index}>{todo.content}</li>
          ))}
        </ul>
      </div>

      <div className="column profile-column">
        <h1>Profile</h1>
        <p>{user?.signInDetails?.loginId}</p>
        <button onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

export default App;
