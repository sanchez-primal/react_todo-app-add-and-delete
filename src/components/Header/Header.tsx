import classNames from 'classnames';
import { useEffect, useRef } from 'react';

type Props = {
  isDropdownDisabled: boolean;
  onSubmit: (title: string) => void;
  todoAddStatus?: TodoAddOperationStatus;
  focusTrigger: boolean;
};

export enum TodoAddOperationStatus {
  LOADING,
  SUCCESS,
  ERROR,
}

export const Header: React.FC<Props> = ({
  isDropdownDisabled,
  onSubmit,
  todoAddStatus = TodoAddOperationStatus.SUCCESS,
  focusTrigger,
}) => {
  const inputField = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (
      todoAddStatus === TodoAddOperationStatus.SUCCESS &&
      inputField.current
    ) {
      inputField.current.value = '';
    }
  }, [todoAddStatus]);

  useEffect(() => {
    // The ref and imperativeHandle way doesn't work for focusing
    //  because when the todo is added, the field is disabled, and the
    //  disabled field can't be focused. Only then it becomes enabled,
    //  but the focus was called before that.
    inputField.current?.focus();
  }, [focusTrigger]);

  /*
  if (inputField.current) {
    if (todoAddStatus === '+') {
      inputField.current.value = '';
    }

    if (todoAddStatus !== 'loading') {
      * Why this is bad, keywords:
      * 1. Code duplication
      * 2. Physical DOM out of sync with VDOM
      * 3. Bad performance (synchronous layout recalc)
      * 4. Not a pure function
      if (inputField.current.attributes.getNamedItem('disabled')) {
        inputField.current.attributes.removeNamedItem('disabled');
      }
      inputField.current.focus()
    }
  }
  */

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // TODO: do this the right way?
    onSubmit((event.currentTarget.elements[0] as HTMLInputElement).value);
  }

  // TODO: Shouldn't this input form be disabled until the todos are loaded?
  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={classNames('todoapp__toggle-all', {
          active: isDropdownDisabled,
        })}
        data-cy="ToggleAllButton"
      />

      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputField}
          disabled={todoAddStatus === TodoAddOperationStatus.LOADING}
        />
      </form>
    </header>
  );
};
