import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './scss/styles.scss';
import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import render from './view.js';
import { uniqueIDGenerator } from './utils.js';
import parsRSS from './parser.js';

export default (i18nextInstance) => {
  setLocale({
    mixed: {
      default: i18nextInstance.t('form.errors.enterValidURL'),
    },
    string: {
      url: i18nextInstance.t('form.errors.enterValidURL'),
    },
  });

  // HTML LOAD
  const html = `<div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
<div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      ...
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18nextInstance.t(
    'modalWindow.close',
  )}</button>
      <a class="btn btn-primary full-article" href="" role="button" target="_blank" rel="noopener noreferrer">${i18nextInstance.t(
    'modalWindow.read',
  )}</a>
    </div>
  </div>
</div>
</div>
    <main class="flex-grow-1">
    <section class="container-fluid bg-dark p-5">
      <div class="row">
        <div class="col-md-10 col-lg-8 mx-auto text-white">
          <h1 class="display-3 mb-0">${i18nextInstance.t('header.title')}</h1>
          <p class="lead">${i18nextInstance.t('header.paragraph')}</p>
          <form action class="rss-form text-body">
            <div class="row">
              <div class="col">
                <div class="form-floating">
                  <input
                    id="url-input"
                    autofocus=""
                    required=""
                    name="url"
                    aria-label="url"
                    class="form-control w-100"
                    placeholder="${i18nextInstance.t('form.input')}"
                    autocomplete="off"
                  />
                  <label for="url-input">${i18nextInstance.t(
    'form.input',
  )}</label>
                </div>
              </div>
              <div class="col-auto">
                <button
                  type="submit"
                  aria-label="add"
                  class="h-100 btn btn-lg btn-primary px-sm-5"
                  disabled
                >
                  ${i18nextInstance.t('form.submit')}
                </button>
              </div>
            </div>
          </form>
          <p class="feedback m-0 position-absolute small text-danger"></p>
        </div>
      </div>
    </section>
    <section class="container-fluid container-xxl p-5">
      <div class="row">
        <div class="col-md-10 col-lg-8 order-1 mx-auto posts"></div>
        <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"></div>
      </div>
    </section>
  </main>`;

  document.body.innerHTML = html;

  // MODEL
  const form = document.querySelector('.rss-form');
  const formInput = document.querySelector('#url-input');
  const buttonForm = document.querySelector('button[type=submit]');
  const postsContainer = document.querySelector('.posts');
  const modalWindow = document.querySelector('.modal');

  // input validate
  const urlValidationSchema = object({
    urlValue: string().url(),
  });

  const state = {
    reset() {
      this.form.input.urlValue = '';
      this.form.error = '';
    },
    form: {
      input: {
        urlValue: '',
      },
      submit: {
        active: false,
      },
      error: '',
      request: 'successful', // sending, sendingEnd
    },
    urls: [],
    feeds: [],
    posts: [],
    readPost: [],
    // readPostID: [],
  };

  let updateTimeoutID;

  // CONTROLLER
  const validateInput = (input) => urlValidationSchema
    .validate(input)
    .then(() => {
      state.form.submit.active = true;
      state.form.error = '';
    })
    .catch((error) => {
      state.form.submit.active = false;
      state.form.error = error.message;
    });

  // input watched state
  const watchedState = onChange(state, (path) => {
    render(state, path, i18nextInstance);
    if (path === 'form.input.urlValue') {
      validateInput(state.form.input).finally(() => {
        render(state, path, i18nextInstance);
      });
    }
  });

  // event listeners
  formInput.addEventListener('input', (e) => {
    watchedState.form.input.urlValue = e.target.value;
    // console.log(state);
  });

  const checkForUpdates = () => {
    state.urls.forEach((url) => {
      const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        url.link,
      )}`;
      axios
        .get(proxyUrl)
        .then((response) => {
          if (
            response.data
            && response.data.status
            && response.data.status.http_code !== 404
          ) {
            const parsedRSS = parsRSS(response.data.contents);

            const newPosts = parsedRSS.posts
              .filter(
                (post) => !state.posts.some(
                  (statePost) => statePost.postHref === post.postHref,
                ),
              )
              .map((post) => ({
                ...post,
                id: uniqueIDGenerator.generateID(),
                urlID: url.id,
              }));

            watchedState.posts.unshift(...newPosts);
          } else {
            console.log(
              `Failed to update URL ${url.link}: HTTP code is 404 or status is undefined`,
            );
          }
        })
        .catch((error) => {
          console.log(`Failed to update URL ${url.link}:`, error);
        });
    });

    updateTimeoutID = setTimeout(checkForUpdates, 5000);
  };

  buttonForm.addEventListener('click', (e) => {
    e.preventDefault();

    if (state.urls.some((url) => url.link === state.form.input.urlValue)) {
      watchedState.form.error = i18nextInstance.t('errors.rssExists');
      formInput.focus();
    } else {
      watchedState.form.request = 'sending';
      const { urlValue } = state.form.input;
      const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        urlValue,
      )}`;
      axios
        .get(proxyUrl)
        .then((response) => {
          if (
            response.data
            && response.data.status
            && response.data.status.http_code !== 404
          ) {
            const parsedRSS = parsRSS(response.data.contents);
            const urlID = uniqueIDGenerator.generateID();

            state.urls.push({
              id: urlID,
              link: urlValue,
            });

            const posts = parsedRSS.posts.map((post) => ({
              ...post,
              id: uniqueIDGenerator.generateID(),
              urlID,
              state: 'new', // viewed
            }));
            watchedState.posts.unshift(...posts);

            watchedState.feeds.unshift({
              id: uniqueIDGenerator.generateID(),
              urlID,
              feedTitle: parsedRSS.feedTitle,
              feedDescription: parsedRSS.feedDescription,
            });

            watchedState.form.request = 'successful';
            state.reset();
            form.reset();

            if (!updateTimeoutID) {
              updateTimeoutID = setTimeout(checkForUpdates, 5000);
            }
          } else {
            watchedState.form.error = i18nextInstance.t('errors.invalidRSS');
            console.log(`Invalid RSS response from ${urlValue}`);
          }
        })
        .catch((error) => {
          if (error.response) {
            watchedState.form.error = i18nextInstance.t('errors.responseError');
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            watchedState.form.error = i18nextInstance.t('errors.requestError');
            console.log(error.request);
          } else {
            watchedState.form.error = i18nextInstance.t('errors.invalidRSS');
            console.log('Error', error.message);
          }
          watchedState.form.request = 'failed';
        })
        .finally(() => {
          formInput.focus();
          // console.log(state);
        });
    }
  });

  postsContainer.addEventListener('click', (e) => {
    const element = e.target;
    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      const elementID = element.getAttribute('data-id');
      const readPostID = state.posts.findIndex(
        (post) => post.id.toString() === elementID,
      );
      if (readPostID !== -1) {
        state.posts[readPostID].state = 'read';
        watchedState.readPost = element;
      }
    }
  });

  modalWindow.addEventListener('show.bs.modal', (e) => {
    const postTitleElement = e.relatedTarget.previousElementSibling;
    watchedState.readPost = postTitleElement;
  });
};
