const VALIDATION_PATTERNS = {
  email: {
    _errorMessage: "Invalid email",
    _func: (value) => /^\S+@\S+$/.test(value),
  },
  password: {
    _errorMessage:
      "Invalid password. Please use special characters (!@#$%^&*), small letters, large letters and numbers. The length should be 6-20 characters long.",
    _func: (value) =>
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/.test(value),
  },
  username: {
    _errorMessage: "The length should be 6-20 characters long.",
    _func: (value) => /^.{6,20}$/.test(value),
  },
  basic: {
    _errorMessage: "Please enter a value.",
    _func: (value) => value.length >= 1,
  },
};

const createValidation = (pattern, value, errorMessage = null) =>
  pattern?._func?.(value)
    ? null
    : errorMessage
      ? errorMessage
      : pattern?._errorMessage;

export default VALIDATION_PATTERNS;
export { createValidation };
