export const render = (state, path) => {
  const formInput = document.querySelector("#url-input");
  const formSubmit = document.querySelector("button[type=submit]");

  switch (path) {
    case "form.input.urlValue":
    case "form.submit.active":
      updateInputView(state, formInput);
      updateSubmitView(state, formSubmit);
      break;
    case "form.error":
      if (formInput) {
        formInput.classList.add("is-invalid");
        formInput.setCustomValidity(state.form.error);
      }
      break;
    default:
      throw new Error(`(Render) Unknown path: ${path}`);
  }
};

const updateInputView = (state, formInput) => {
  const { urlValue } = state.form.input;
  const hasError = state.form.error.length !== 0;

  if (formInput) {
    formInput.classList.toggle("is-invalid", hasError && urlValue !== "");
  }
};

const updateSubmitView = (state, formSubmit) => {
  const hasError = state.form.error.length !== 0;
  const { active } = state.form.submit;

  if (formSubmit) {
    formSubmit.disabled = hasError || !active;
  }
};
