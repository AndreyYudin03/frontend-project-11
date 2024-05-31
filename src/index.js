import "./scss/styles.scss";
import * as bootstrap from "bootstrap";
import { object, string } from "yup";
import onChange from "on-change";
import { render } from "./view.js";

// feeds
const feedURLs = [];

// input validate
const urlValidationSchema = object({
  urlValue: string()
    .url("Введите корректный URL")
    // .min(1, "Введите корректный URL")
    .notOneOf(feedURLs, "Такой RSS уже существует"),
});

// MODEL
const form = document.querySelector(".rss-form");
const formInput = form.querySelector("#url-input");
const buttonForm = form.querySelector("button[type=submit]");

const state = {
  reset() {
    this.form.input.urlValue = "";
    this.form.submit.active = false;
    this.form.error = "";
  },
  form: {
    input: {
      urlValue: "",
    },
    submit: {
      active: false,
    },
    error: "",
  },
};

// CONTROLLER
const validateInput = (input) => {
  return urlValidationSchema
    .validate(input)
    .then(() => {
      state.form.submit.active = true;
      state.form.error = "";
    })
    .catch((error) => {
      state.form.submit.active = false;
      state.form.error = error.message;
    });
};

// input watched state
const watchedState = onChange(state, (path) => {
  render(state, path);
  if (path === "form.input.urlValue") {
    validateInput(state.form.input).finally(() => {
      render(state, path);
    });
  }
});

// event listeners
formInput.addEventListener("input", (e) => {
  watchedState.form.input.urlValue = e.target.value;
});

buttonForm.addEventListener("click", (e) => {
  e.preventDefault();

  if (feedURLs.includes(state.form.input.urlValue)) {
    watchedState.form.error = "Такой RSS уже существует";
    formInput.focus();
  } else {
    feedURLs.push(state.form.input.urlValue);
    state.reset();
    form.reset();
    formInput.focus();
  }
});
