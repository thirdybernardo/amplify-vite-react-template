import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);
  const { user, signOut } = useAuthenticator();
  useEffect(() => {
    console.log('User object:', user);
  }, [user]); // Runs whenever the `user` object updates

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        setTodos([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  const createTodo = async () => {
    await client.models.Todo.create({
      content: window.prompt('Todo content?'),
      isDone: false,
    });
    // no more manual refetchTodos required!
    // - fetchTodos()
  };
  const fetchTodos = async () => {
    const { data: items } = await client.models.Todo.list();
    setTodos(items);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  /*  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  } */

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map(({ id, content }) => (
          <li key={id}>{content}</li>
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
