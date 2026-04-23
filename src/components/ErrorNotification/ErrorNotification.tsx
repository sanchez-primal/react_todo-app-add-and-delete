import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { DefaultErrorMessages, ErrorMessage } from '../../types/ErrorMessages';

type Props = {
  errorMessage: ErrorMessage;
};

const DISPLAY_TIME = 3000;

export const ErrorNotification: React.FC<Props> = ({ errorMessage }) => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    if (errorMessage === DefaultErrorMessages.NONE) {
      return;
    }

    setIsHidden(false);

    const timer = setTimeout(() => {
      setIsHidden(true);
    }, DISPLAY_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage]);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        {
          hidden: isHidden,
        },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => setIsHidden(true)}
      />
      {errorMessage}
    </div>
  );
};
