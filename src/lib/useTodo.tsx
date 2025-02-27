// REACT
import { useEffect, useReducer } from 'react';
//ASSETS
import { nouns, adjectives, suffixes, nounsEN, verbsEN } from './words';
// External Libraries
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
var randomSentence = require('random-sentence');
const PhaseGen = require('korean-random-words');
// Types
type Options = {
    dataNum?: number;
    contentLength?: number;
    useLocalStorage?: boolean;
    lang?: string;
};
type TodoItem = {
    id: string;
    title: string;
    content: string;
    date?: string;
    completed?: boolean;
};
type NewTodoItem = {
    title: string;
    content: string;
};
enum TodoActionKind {
    ADD = 'ADD',
    DELETE = 'DELETE',
    COMPLETE = 'COMPLETE',
    EDIT = 'EDIT'
}
type TodoAction =
    | { type: TodoActionKind.ADD; todo: { title: string; content: string } }
    | { type: TodoActionKind.DELETE; id: string }
    | { type: TodoActionKind.COMPLETE; id: string }
    | { type: TodoActionKind.EDIT; id: string; newContents: { title?: string; content?: string } };
type TodoListState = TodoItem[];
/**
 *
 */
const todoReducer = (state: TodoListState, action: TodoAction): TodoListState => {
    switch (action.type) {
        case TodoActionKind.ADD: {
            const { todo } = action;
            return [
                ...state,
                {
                    id: uuidv4(),
                    title: todo.title,
                    content: todo.content,
                    completed: false,
                    date: moment().subtract(10, 'days').calendar()
                }
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
        case TodoActionKind.EDIT: {
            const { id: targetedItemId, newContents } = action;

            return [...state].map((todo) => {
                if (todo.id === targetedItemId) {
                    return {
                        ...todo,
                        title: newContents.title ? newContents.title : todo.title,
                        content: newContents.content ? newContents.content : todo.content
                    };
                }
                return todo;
            });
        }
        default: {
            return state;
        }
    }
};
/**
 *
 */
const generateTitle = (): string => {
    const phaseGen = new PhaseGen();
    const phaseGenCustom = new PhaseGen({
        customNouns: ['키우기', '만들기', '찾기']
    });
    return phaseGen.getNoun() + ' ' + phaseGenCustom.getNoun();
};

/**
 *
 */
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

/**
 *
 */
const generateTodoList = (dataNum: number, contentLength: number): TodoListState => {
    const todoList = Array(dataNum)
        .fill(0)
        .map(() => {
            return {
                id: uuidv4(),
                title: generateTitle(),
                content: generateContent(contentLength),
                completed: false,
                date: moment().subtract(10, 'days').calendar()
            };
        });
    return todoList;
};

/**
 *
 */
const generateTitleEN = (): string => {
    let title = verbsEN[Math.floor(Math.random() * verbsEN.length)] + ' ' + nounsEN[Math.floor(Math.random() * nounsEN.length)];

    title = title.substring(0, 0) + title[0].toLocaleUpperCase() + title.substring(1, title.length);

    return title;
};

/**
 *
 */
const generateContentEN = (contentLength: number): string => {
    return randomSentence({ min: contentLength, max: contentLength });
};

/**
 *
 */
const generateTodoListEN = (dataNum: number, contentLength: number): TodoListState => {
    const todoList = Array(dataNum)
        .fill(0)
        .map(() => {
            return {
                id: uuidv4(),
                title: generateTitleEN(),
                content: generateContentEN(contentLength),
                completed: false,
                date: moment().subtract(10, 'days').calendar()
            };
        });
    return todoList;
};

/**
 *
 */
const useTodo = ({ dataNum = 5, contentLength = 25, useLocalStorage = false, lang = 'en' }: Options = {}) => {
    // JSON functions
    const serialize = JSON.stringify;
    const deserialize = JSON.parse;
    // Todo States
    const initialState = lang === 'kr' ? generateTodoList(dataNum, contentLength) : lang === 'en' ? generateTodoListEN(dataNum, contentLength) : generateTodoList(dataNum, contentLength);

    const localStorageList = window.localStorage.getItem('todo-list');
    const [state, dispatch] = useReducer(todoReducer, localStorageList ? deserialize(localStorageList) : initialState);
    // Adding new todo item to the state
    const addTodo = ({ title, content }: NewTodoItem) => {
        const newItem = { title, content };
        if (title === '' || content === '') {
            return alert('title and content value is missing');
        }
        dispatch({ type: TodoActionKind.ADD, todo: newItem });
    };
    // Removing a todo item from the state
    const deleteTodo = (id: string) => {
        dispatch({ type: TodoActionKind.DELETE, id });
    };

    // Edit a todo item contents
    const editTodo = (id: string, newContents: { title?: string; content?: string }) => {
        if (!newContents.title && !newContents.content) return;
        dispatch({ type: TodoActionKind.EDIT, id, newContents });
    };

    // Toggle a todo item completion (true / false)
    const toggleCompletion = (id: string) => {
        dispatch({ type: TodoActionKind.COMPLETE, id });
    };

    // storing or removing todo-list from localStorage
    useEffect(() => {
        if (!useLocalStorage) {
            window.localStorage.removeItem('todo-list');
        }
        if (!useLocalStorage) return;
        window.localStorage.setItem('todo-list', serialize(state));
    }, [state, serialize, useLocalStorage]);
    return { todoItems: state, addTodo, deleteTodo, editTodo, toggleCompletion };
};
export { useTodo };
