import { FormEvent } from "react";
import { useState } from "./src/hooks/useState.ts";
import { useEffect } from "./src/hooks/useEffect.ts";
import * as Miku from "./src/index.ts";
import { workLoop } from "./src/render/render.ts";
import { globalState } from "./src/globals/globals";
const aa = document.body.querySelector("#app");

// Type definitions
type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
};

type FilterType = 'all' | 'active' | 'completed';

type NotificationType = {
  type: 'add' | 'delete' | 'clear';
  text: string;
};

// Custom hook for localStorage persistence
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Custom hook for notifications
const useNotification = () => {
  const [notification, setNotification] = useState<NotificationType | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return [notification, setNotification] as const;
};

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [inputValue, setInputValue] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [notification, setNotification] = useNotification();

  // Keyboard shortcut effect
  useEffect(() => {
    console.log("done")
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        addTodo();

    };
  }
    window.addEventListener('keydown', handleKeyDown);

  }, []);

  const addTodo = (): void => {
    if (inputValue.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
    setNotification({ type: 'add', text: 'Todo added!' });
  };

  const toggleTodo = (id: number): void => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number): void => {
    setTodos(todos.filter(todo => todo.id !== id));
    setNotification({ type: 'delete', text: 'Todo deleted!' });
  };

  const clearCompleted = (): void => {
    setTodos(todos.filter(todo => !todo.completed));
    setNotification({ type: 'clear', text: 'Completed todos cleared!' });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-10 transition-all duration-300 hover:shadow-2xl">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">Fancy Todo List</h1>
      <p className="text-gray-500 text-center mb-6">Ctrl+Enter to add todos</p>
      
   
      
      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          className="flex-grow px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none transition-colors"
        />
        <button
          id="add-button"
          onClick={addTodo}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
        >
          Add
        </button>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>{activeCount} active</span>
        <span>{completedCount} completed</span>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full capitalize transition-colors ${
              filter === f 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      
      {/* Todo List */}
      <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
        {filteredTodos.length === 0 ? (
          <li className="text-center py-8 text-gray-500">
            No todos found. Add a new todo to get started!
          </li>
        ) : (
          filteredTodos.map(todo => (
            <li 
              key={todo.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                todo.completed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-indigo-50 border border-indigo-200'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span 
                  className={`ml-3 text-lg ${
                    todo.completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-800'
                  }`}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
      {/* Notification */
      notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow
          ${notification.type === 'add' ? 'bg-green-100 text-green-800' :
            notification.type === 'delete' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'}`}>
          {notification?.text}
        </div>
      )}
      {/* Clear Button */}
      <div className="flex justify-center">
        <button
          onClick={clearCompleted}
          disabled={completedCount === 0}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            completedCount === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
          }`}
        >
          Clear Completed
        </button>
      </div>
    </div>
  );
};

if (aa) Miku.render(<TodoApp />, aa);


requestIdleCallback(workLoop)