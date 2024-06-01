const formInput = document.querySelector("#url-input");
const formSubmit = document.querySelector("button[type=submit]");

export const render = (state, path) => {
  switch (path) {
    case "form.input.urlValue":
    case "form.submit.active":
      updateInputView(state);
      updateSubmitView(state);
      break;
    case "form.error":
      formInput.classList.add("is-invalid");
      break;
    default:
      throw new Error(`(Render) Unknown path: ${path}`);
  }
};

const updateInputView = (state) => {
  const { urlValue } = state.form.input;
  const hasError = state.form.error.length !== 0;

  formInput.classList.toggle("is-invalid", hasError && urlValue !== "");
};

const updateSubmitView = (state) => {
  const hasError = state.form.error.length !== 0;
  const { active } = state.form.submit;

  formSubmit.disabled = hasError || !active;
};
