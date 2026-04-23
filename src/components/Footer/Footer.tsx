import classNames from 'classnames';

export enum TodoStatus {
  ALL = 'All',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
}

type Props = {
  incompleteTodoQuantity: number;
  onFilterSelect: (filterType: TodoStatus) => void;
  activeFiltering: TodoStatus;
  onDeleteCompleted: () => void;
  isDeleteCompletedButtonDisabled: boolean;
};

export const Footer: React.FC<Props> = ({
  incompleteTodoQuantity,
  onFilterSelect,
  activeFiltering,
  onDeleteCompleted,
  isDeleteCompletedButtonDisabled,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${incompleteTodoQuantity} items left`}
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          data-cy="FilterLinkAll"
          onClick={() => onFilterSelect(TodoStatus.ALL)}
          className={classNames('filter__link', {
            selected: activeFiltering === TodoStatus.ALL,
          })}
        >
          All
        </a>

        <a
          href="#/active"
          data-cy="FilterLinkActive"
          onClick={() => onFilterSelect(TodoStatus.ACTIVE)}
          className={classNames('filter__link', {
            selected: activeFiltering === TodoStatus.ACTIVE,
          })}
        >
          Active
        </a>

        <a
          href="#/completed"
          data-cy="FilterLinkCompleted"
          onClick={() => onFilterSelect(TodoStatus.COMPLETED)}
          className={classNames('filter__link', {
            selected: activeFiltering === TodoStatus.COMPLETED,
          })}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        onClick={onDeleteCompleted}
        disabled={isDeleteCompletedButtonDisabled}
      >
        Clear completed
      </button>
    </footer>
  );
};
