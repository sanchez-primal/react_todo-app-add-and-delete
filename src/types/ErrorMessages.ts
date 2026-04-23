export enum DefaultErrorMessages {
  NONE = '',
  FAILED_LOAD = 'Unable to load todos',
  EMPTY_TITLE = 'Title should not be empty',
  FAILED_ADD = 'Unable to add a todo',
  FAILED_DELETE = 'Unable to delete a todo',
  FAILED_UPDATE = 'Unable to update a todo',
}

export type UnexpectedErrorMessage =
  `An unexpected error has occurred. ${string}`;
// could also make a helper, but it's a wee bit too much for this project.
// although it doesn't allow string concatenation and etc in this form...

export type ErrorMessage = DefaultErrorMessages | UnexpectedErrorMessage;
