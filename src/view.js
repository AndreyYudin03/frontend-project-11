import { read } from "@popperjs/core";
import * as bootstrap from "bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";

export const render = (state, path, i18nextInstance) => {
  const formInput = document.querySelector("#url-input");
  const formSubmit = document.querySelector("button[type=submit]");
  const formFeedback = document.querySelector(".feedback");
  const postsContainer = document.querySelector(".posts");
  const feedsContainer = document.querySelector(".feeds");

  switch (path) {
    case "form.input.urlValue":
    case "form.submit.active":
      updateInputView(state, formInput);
      updateSubmitView(state, formSubmit);
      updateFormFeedback(state, formFeedback);
      break;
    case "form.error":
      if (formInput) {
        formInput.classList.add("is-invalid");
        formInput.setCustomValidity(state.form.error);
        updateFormFeedback(state, formFeedback);
      }
      break;
    case "form.request":
      // const { request } = state.form;
      switch (state.form.request) {
        case "sending":
          formSubmit.disabled = true;
          formInput.disabled = true;
          break;
        case "failed":
          formSubmit.disabled = false;
          formInput.disabled = false;
          formFeedback.classList.replace("text-success", "text-danger");
          formFeedback.textContent = i18nextInstance.t("invalid_url");
          break;
        case "successful":
          formSubmit.disabled = true;
          formInput.disabled = false;
          formFeedback.classList.replace("text-danger", "text-success");
          formFeedback.textContent = i18nextInstance.t("rss_successful");
          break;
        default:
          throw new Error(
            `(Render) Unknown request state: ${state.form.request}`
          );
      }
      break;
    case "posts":
      updatePostsView(state, postsContainer, i18nextInstance);
      break;
    case "feeds":
      updateFeedsView(state, feedsContainer, i18nextInstance);
      break;
    case "readPost":
      updatePostReadView(state);
      // renderModalView(state);
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
  const urlIsEmpty = state.form.input.urlValue.length === 0;

  if (formSubmit) {
    formSubmit.disabled = hasError || !active || urlIsEmpty;
  }
};

const updateFormFeedback = (state, formFeedback) => {
  const hasError = state.form.error.length !== 0;

  if (hasError) {
    formFeedback.classList.replace("text-success", "text-danger");
    formFeedback.textContent = state.form.error;
  } else {
    formFeedback.textContent = "";
  }
};

const updatePostsView = (state, postsContainer, i18nextInstance) => {
  const posts = state.posts
    .map((post) => {
      const postFont =
        post.state === "read" ? "fw-normal link-dark" : "fw-bold";
      return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${post.postHref}" class="${postFont}" data-id="${
        post.id
      }" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="${
          post.id
        }" data-bs-toggle="modal" data-bs-target="#modal" data-bs-title="${
        post.postTitle
      }" data-bs-description="${post.postDescription}">
        ${i18nextInstance.t("main.postWatch")}
        </button>
      </li>`;
    })
    .join("\n");

  postsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18nextInstance.t("main.postsTitle")}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
      ${posts}
    </ul>
  </div>`;
};

const updateFeedsView = (state, feedsContainer, i18nextInstance) => {
  const feeds = state.feeds
    .map((feed) => {
      return `<li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${feed.feedTitle}</h3>
    <p class="m-0 small text-black-50">${feed.feedDescription}</p>
    </li>`;
    })
    .join("\n");

  feedsContainer.innerHTML = `<div class="card border-0">
  <div class="card-body">
  <h2 class="card-title h4">${i18nextInstance.t("main.feedsTitle")}</h2>
  </div>
  <ul class="list-group border-0 rounded-0">
  ${feeds}
  </ul>
  </div>`;
};

const updatePostReadView = (state) => {
  const { readPost } = state;

  const updateReadPostClass = (element) => {
    element.classList.replace("fw-bold", "fw-normal");
    element.classList.add("link-dark");
  };

  if (readPost.tagName === "A") {
    updateReadPostClass(readPost);
    console.log("A tagName");
  } else if (readPost.tagName === "BUTTON") {
    const liContainer = readPost.closest("li");
    if (liContainer) {
      const postTitle = liContainer.querySelector("a");
      if (postTitle) {
        updateReadPostClass(postTitle);
        console.log("BUTTON tagName");
      } else {
        console.error("No A tag found inside LI container");
      }
    } else {
      console.error("No LI container found for BUTTON");
    }
  }
};
