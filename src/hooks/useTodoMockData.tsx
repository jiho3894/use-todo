// REACT
import { useReducer } from "react";

//ASSETS
import { nouns, adjectives, suffixes } from "../assetes/words";

// External Libraries
import { v4 as uuidv4 } from "uuid";
const PhaseGen = require("korean-random-words");

// Types
type Options = {
  dataNum: number;
  contentLength?: number;
};

type TodoItem = {
  id?: string;
  title: string;
  content: string;
  // date: Date;
  completed?: boolean;
};
enum TodoActionKind {
  ADD = "ADD",
  DELETE = "DELETE",
  COMPLETE = "COMPLETE",
}

type TodoAction =
  | { type: TodoActionKind.ADD; todo: TodoItem }
  | { type: TodoActionKind.DELETE; id: string }
  | { type: TodoActionKind.COMPLETE; id: string };

type TodoListState = TodoItem[];

const todoReducer = (state: TodoListState, action: TodoAction): TodoListState => {
  switch (action.type) {
    case TodoActionKind.ADD: {
      const { todo } = action;
      return [
        ...state,
        { id: uuidv4(), title: todo.title, content: todo.content, completed: todo.completed },
      ];
    }

    case TodoActionKind.DELETE: {
      const { id: targetedItemId } = action;
      return [...state].filter((todo) => todo.id !== targetedItemId);
    }

    case TodoActionKind.COMPLETE: {
      const { id: targetedItemId } = action;
      return [...state].map((todo) => {
        if (todo.id === targetedItemId) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });
    }

    default: {
      return state;
    }
  }
};
const generateTitle = (): string => {
  const phaseGen = new PhaseGen();
  const phaseGenCustom = new PhaseGen({ customNouns: ["키우기", "만들기", "찾기"] });

  return phaseGen.getNoun() + " " + phaseGenCustom.getNoun();
};

const generateContent = (contentLength: number): string => {
  let content = `${nouns[Math.floor(Math.random() * nouns.length)]}는 `;

  while (content.length <= contentLength) {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    content += `${randomAdjective}${randomSuffix} `;
  }
  content += `${adjectives[Math.floor(Math.random() * adjectives.length)]}하다.`;

  return content;
};

const generateTodoList = (dataNum: number, contentLength: number): TodoListState => {
  const todoList = Array(dataNum)
    .fill(0)
    .map(() => {
      return {
        id: uuidv4(),
        title: generateTitle(),
        content: generateContent(contentLength),
        completed: false,
      };
    });

  return todoList;
};

const useTodoMock = ({ dataNum, contentLength = 25 }: Options) => {
  const initialState = generateTodoList(dataNum, contentLength);

  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Adding new todo item to the state
  const addTodo = (todo: TodoItem) => {
    dispatch({ type: TodoActionKind.ADD, todo });
  };

  // Removing a todo item from the state
  const deleteTodo = (id: string) => {
    dispatch({ type: TodoActionKind.DELETE, id });
  };

  // Toggle a todo item completion (true / false)
  const toggleTodo = (id: string) => {
    dispatch({ type: TodoActionKind.COMPLETE, id });
  };

  return { todoList: state, addTodo, deleteTodo, toggleTodo };
};

export default useTodoMock;
