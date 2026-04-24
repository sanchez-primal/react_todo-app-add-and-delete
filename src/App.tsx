import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, addTodo, deleteTodo, USER_ID } from './api/todos';

import { ErrorNotification } from './components/ErrorNotification';
import { Footer, TodoStatus } from './components/Footer';
import { Header, TodoAddOperationStatus } from './components/Header';
import { Todo } from './types/Todo';
import { Todo as TodoItem } from './components/Todo';
import { DefaultErrorMessages, ErrorMessage } from './types/ErrorMessages';
import { createUnexpectedErrorMessage } from './utils/errorMessages';

export const App: React.FC = () => {
  // ! add notification BEFORE every next request.

  // #region todo display state

  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoIdsState, setLoadingTodoIdsState] = useState<number[]>([]);
  const loadingTodoIdsRef = useRef<Set<number>>(new Set());
  // The ref is to conquer the Catch-22 in the handleDeleteAllCompleted method:
  // requiring the freshest loadingTodoIds state synchronously
  // after calling the updating function.
  // Although I probably shouldn't have complicated that.
  const [filteringByCompleted, setFilteringByCompleted] = useState(
    TodoStatus.All,
  );

  // #endregion

  // #region error state

  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    DefaultErrorMessages.NONE,
  );
  const [errorRenderIteration, setErrorRenderIteration] = useState(1);

  // #endregion

  // #region ...

  const [taskInputFocusTrigger, setTaskInputFocusTrigger] = useState(true);
  const [todoAddStatus, setTodoAddStatus] = useState(
    TodoAddOperationStatus.SUCCESS,
  );
  const [isDeleteAllCompletedLoading, setIsDeleteAllCompletedLoading] =
    useState(false);

  // #endregion

  // #region additional state manipulation functions

  const displayError = useCallback(
    (message: typeof errorMessage) => {
      setErrorMessage(message);
      setErrorRenderIteration(current => current + 1);
    },
    [setErrorMessage, setErrorRenderIteration],
  );

  function updateLoadingTodoIdsState() {
    setLoadingTodoIdsState(Array.from(loadingTodoIdsRef.current));
  }

  function markAsLoading(id: number) {
    // TODO: Could be split into separate actions to aggregate and not run
    // TODO:  updateLoadingTodoIdsState on every single id change.
    loadingTodoIdsRef.current.add(id);
    updateLoadingTodoIdsState();
  }

  function unmarkAsLoading(id: number) {
    loadingTodoIdsRef.current.delete(id);
    updateLoadingTodoIdsState();
  }

  function focusInput() {
    setTaskInputFocusTrigger(current => !current);
  }

  // #endregion

  // #region todo manipulation functions

  const handleFetchTodos = useCallback(async () => {
    try {
      const fetchedTodos = await getTodos();

      setTodos(fetchedTodos);
    } catch (error) {
      displayError(DefaultErrorMessages.FAILED_LOAD);
    }
  }, [setTodos, displayError]);

  async function handleAddNewTodo(title: string) {
    setTodoAddStatus(TodoAddOperationStatus.LOADING);

    const trimmed = title.trim();

    if (!trimmed.length) {
      displayError(DefaultErrorMessages.EMPTY_TITLE);
      setTodoAddStatus(TodoAddOperationStatus.ERROR);

      return;
    }

    const todoTemplate = { title: trimmed, userId: USER_ID, completed: false };

    setTempTodo({ ...todoTemplate, id: 0 });

    try {
      const newTodo = await addTodo(todoTemplate);

      setTodos(current => [...current, newTodo]);
      setTodoAddStatus(TodoAddOperationStatus.SUCCESS);
    } catch (error) {
      displayError(DefaultErrorMessages.FAILED_ADD);
      setTodoAddStatus(TodoAddOperationStatus.ERROR);
    } finally {
      setTempTodo(null);
      focusInput();
    }
  }

  async function handleDeleteTodo(id: number) {
    markAsLoading(id);

    try {
      await deleteTodo(id);

      setTodos(current => [...current].filter(todo => todo.id !== id));
      // ? Is putting the state in ref in Set
      // ? and .deleting it there more effective?
    } catch (error) {
      displayError(DefaultErrorMessages.FAILED_DELETE);
    } finally {
      unmarkAsLoading(id);
      focusInput();
    }
  }

  // Optionally: Add an isLoading prop to the todos[] state.
  //  Or have loadingTodos be an array of the same size as todos[],
  //  and store the loading state there as boolean
  async function handleDeleteAllCompleted() {
    setIsDeleteAllCompletedLoading(true);

    const idsToDeleteInThisOperation: number[] = [];

    for (const todo of todos) {
      const id = todo.id;

      if (todo.completed && !loadingTodoIdsRef.current.has(id)) {
        idsToDeleteInThisOperation.push(id);
        markAsLoading(id);
      }
    }

    try {
      const deletions = await Promise.allSettled(
        idsToDeleteInThisOperation.map(id => deleteTodo(id)),
      );

      deletions.forEach((result, index) => {
        // * could be aggregated too, at least it's not critical.
        if (result.status === 'fulfilled') {
          setTodos(current =>
            [...current].filter(
              todo => todo.id !== idsToDeleteInThisOperation[index],
            ),
          );

          return;
        }

        if (result.status === 'rejected') {
          displayError(DefaultErrorMessages.FAILED_DELETE);
        }
      });
    } catch (error) {
      // * Usually the catch block catches both errors and rejected promises,
      // *  but with the Promise.allSettled method the rejects go into the
      // *  .then() chain.
      // ?  But this should've caught errors! And it doesn't...
      displayError(
        createUnexpectedErrorMessage(
          'Please refresh the page to get the latest updates.',
        ),
      );
    } finally {
      idsToDeleteInThisOperation.forEach(unmarkAsLoading);
      setIsDeleteAllCompletedLoading(false);
      focusInput();
    }
  }

  // #endregion

  // #region preparation

  useEffect(() => {
    handleFetchTodos();
  }, [handleFetchTodos]);

  const filteredTodos = todos.filter(todo => {
    let satisfiesCompleted: boolean;

    switch (filteringByCompleted) {
      case TodoStatus.Active:
        satisfiesCompleted = !todo.completed;
        break;
      case TodoStatus.Completed:
        satisfiesCompleted = todo.completed;
        break;
      default:
        satisfiesCompleted = true;
        break;
    }

    return satisfiesCompleted;
  });

  let incompleteTodoQuantity = 0;

  todos.forEach(todo => {
    if (!todo.completed) {
      incompleteTodoQuantity += 1;
    }
  });

  const hasCompletedTodos = todos.length !== incompleteTodoQuantity;

  // #endregion

  // #region returns

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          isDropdownDisabled={incompleteTodoQuantity !== 0}
          onSubmit={handleAddNewTodo}
          todoAddStatus={todoAddStatus}
          focusTrigger={taskInputFocusTrigger}
        />

        {(!!todos.length || tempTodo) && (
          <section className="todoapp__main" data-cy="TodoList">
            {filteredTodos.map(todo => {
              return (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isSelected={false}
                  isLoading={loadingTodoIdsState.includes(todo.id)}
                  onDeleteTodo={handleDeleteTodo}
                />
              );
            })}

            {tempTodo && (
              <TodoItem
                key="loading"
                todo={tempTodo}
                isSelected={false}
                isLoading={true}
                onDeleteTodo={() => null}
              />
            )}
          </section>
        )}

        {!!todos.length && (
          <Footer
            incompleteTodoQuantity={incompleteTodoQuantity}
            onFilterSelect={setFilteringByCompleted}
            activeFiltering={filteringByCompleted}
            onDeleteCompleted={handleDeleteAllCompleted}
            isDeleteCompletedButtonDisabled={
              !hasCompletedTodos || isDeleteAllCompletedLoading
            }
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        key={errorRenderIteration}
      />
    </div>
  );

  // #endregion
};
