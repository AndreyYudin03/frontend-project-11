import { extractTextFromHtml } from './utils.js';

const updateInputView = (state, formInput) => {
  const { urlValue } = state.form.input;
  const hasError = Boolean(state.form.error);

  if (formInput) {
    formInput.classList.toggle('is-invalid', hasError && urlValue !== '');
  }
};

const updateSubmitView = (state, formSubmit) => {
  const hasError = Boolean(state.form.error);
  const { active } = state.form.submit;
  const urlIsEmpty = state.form.input.urlValue.length === 0;

  if (formSubmit) {
    formSubmit.disabled = hasError || !active || urlIsEmpty;
  }
};

const updateFormFeedback = (state, formFeedback, i18nextInstance) => {
  const hasError = Boolean(state.form.error);

  if (hasError) {
    formFeedback.classList.replace('text-success', 'text-danger');
    formFeedback.textContent = i18nextInstance.t(state.form.error);
  } else {
    formFeedback.textContent = '';
  }
};

const updatePostsView = (state, postsContainer, i18nextInstance) => {
  const postsHTML = state.posts
    .map(({
      id, postHref, postTitle, state: postState,
    }) => {
      const postFont = postState === 'read' ? 'fw-normal link-dark' : 'fw-bold';
      return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${postHref}" class="${postFont}" data-id="${id}" target="_blank" rel="noopener noreferrer">${postTitle}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">
          ${i18nextInstance.t('main.postWatch')}
        </button>
      </li>`;
    })
    .join('');

  postsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18nextInstance.t('main.postsTitle')}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
      ${postsHTML}
    </ul>
  </div>`;
};

const updateFeedsView = (state, feedsContainer, i18nextInstance) => {
  const feedsHTML = state.feeds
    .map(
      ({ feedTitle, feedDescription }) => `
      <li class="list-group-item border-0 border-end-0">
        <h3 class="h6 m-0">${feedTitle}</h3>
        <p class="m-0 small text-black-50">${feedDescription}</p>
      </li>`,
    )
    .join('');

  feedsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18nextInstance.t('main.feedsTitle')}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
      ${feedsHTML}
    </ul>
  </div>`;
};

const updatePostReadView = ({ readPost }) => {
  const updateReadPostClass = (element) => {
    element.classList.replace('fw-bold', 'fw-normal');
    element.classList.add('link-dark');
  };

  if (readPost.tagName === 'A') {
    updateReadPostClass(readPost);
  } else if (readPost.tagName === 'BUTTON') {
    updateReadPostClass(readPost.previousElementSibling);
  }
};

const updateModalView = (state) => {
  const { readPost, posts } = state;
  const modalWindow = document.querySelector('.modal');
  const modalTitle = modalWindow.querySelector('.modal-title');
  const modalBody = modalWindow.querySelector('.modal-body');
  const modalRead = modalWindow.querySelector('a');

  if (readPost.tagName === 'A') {
    modalTitle.textContent = readPost.textContent;
    modalBody.textContent = readPost.href;
    modalRead.setAttribute('href', readPost.href);
  } else if (readPost.tagName === 'BUTTON') {
    const postID = readPost.getAttribute('data-id');
    const { postTitle, postDescription, postHref } = posts.find(
      (post) => post.id.toString() === postID,
    );

    modalTitle.textContent = postTitle;
    modalBody.textContent = extractTextFromHtml(postDescription);
    modalRead.setAttribute('href', postHref);
  }
};

export default (state, path, i18nextInstance) => {
  const formInput = document.querySelector('#url-input');
  const formSubmit = document.querySelector('button[type=submit]');
  const formFeedback = document.querySelector('.feedback');
  const postsContainer = document.querySelector('.posts');
  const feedsContainer = document.querySelector('.feeds');

  switch (path) {
    case 'form.input.urlValue':
    case 'form.submit.active':
      updateInputView(state, formInput);
      updateSubmitView(state, formSubmit);
      updateFormFeedback(state, formFeedback, i18nextInstance);
      break;
    case 'form.error':
      if (formInput) {
        formInput.classList.add('is-invalid');
        formInput.setCustomValidity(state.form.error);
        updateFormFeedback(state, formFeedback, i18nextInstance);
      }
      break;
    case 'form.request':
      switch (state.form.request) {
        case 'sending':
          formSubmit.disabled = true;
          formInput.disabled = true;
          break;
        case 'failed':
          formFeedback.classList.replace('text-success', 'text-danger');
          formSubmit.disabled = true;
          formInput.disabled = false;
          break;
        case 'successful':
          formFeedback.classList.replace('text-danger', 'text-success');
          formFeedback.textContent = i18nextInstance.t('successfulRequest');
          formSubmit.disabled = true;
          formInput.disabled = false;
          break;
        default:
          throw new Error(
            `(Render) Unknown request state: ${state.form.request}`,
          );
      }
      break;
    case 'posts':
      updatePostsView(state, postsContainer, i18nextInstance);
      break;
    case 'feeds':
      updateFeedsView(state, feedsContainer, i18nextInstance);
      break;
    case 'readPost':
      updatePostReadView(state);
      updateModalView(state);
      break;
    default:
      console.log(`(Render) Unknown path: ${path}`);
  }
};
