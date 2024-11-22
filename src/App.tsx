import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);
  const { user, signOut } = useAuthenticator();

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const { data: todos, errors } = await client.models.Todo.list();
      if (errors) {
        console.error('Error fetching todos:', errors);
      } else {
        setTodos(todos);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  // Fetch todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, []); // Empty dependency array means this runs once after the initial render

  function createTodo() {
    client.models.Todo.create({ content: window.prompt('Todo content') })
      .then(() => fetchTodos()) // Re-fetch todos after creation
      .catch((error) => console.error('Error creating todo:', error));
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
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
