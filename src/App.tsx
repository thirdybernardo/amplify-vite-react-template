import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
type Todo = Schema['Todo']['type'];

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { user, signOut } = useAuthenticator();

  // Fetch todos when the component mounts

  // Fetch todos when the component mounts or the user changes
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
      await client.models.Todo.create({
        content,
        isDone: false,
        owner: user.username, // Associate todo with the logged-in user
      });
      alert('Todo created successfully!');
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo.');
    }
  };
  // Function to update a todo item
  const updateTodo = (id: string) => {
    const newContent = window.prompt('Enter new content for the todo:');

    if (!newContent) {
      alert('Todo content cannot be empty.');
      return;
    }

    const todoup: { id: string; content: string } = {
      id,
      content: newContent,
    };

    // Call the API to update the todo item
    client.models.Todo.update(todoup)
      .then((updatedTodo) => {
        // Update the local state with the updated todo
        console.log('Updated Todo from backend:', updatedTodo);
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, content: newContent } : todo
          )
        );
        alert('Todo updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating todo:', error);
        alert('Failed to update the todo.');
      });
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoupDelete: { id: string } = {
        id,
      };
      await client.models.Todo.delete(todoupDelete); // Use the ID of the todo to delete
      // After successful deletion, update the state to remove the deleted todo
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      alert('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete the todo.');
    }
  };

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.content}
            <button onClick={() => updateTodo(todo.id)}>Update</button>{' '}
            {/* Update button */}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
