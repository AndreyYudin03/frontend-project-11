import "./scss/styles.scss";
// import * as bootstrap from "bootstrap";
import { object, string, setLocale } from "yup";
import onChange from "on-change";
import { render } from "./view.js";
import i18n from "i18next";
import { ru } from "./locales/index.js";
import uniqueIDGenerator from "./utils.js";
import axios from "axios";
import parsRSS from "./parser.js";

// locales
const i18nextInstance = i18n.createInstance();
i18nextInstance
  .init({
    lng: "ru",
    debug: true,
    resources: {
      ru,
    },
  })
  .then(() => {
    // locale load
    setLocale({
      mixed: {
        default: i18nextInstance.t("enter_valid_url"),
      },
      string: {
        url: i18nextInstance.t("enter_valid_url"),
      },
    });
    // HTML LOAD
    document.addEventListener("DOMContentLoaded", () => {
      const html = `<main class="flex-grow-1">
      <section class="container-fluid bg-dark p-5">
        <div class="row">
          <div class="col-md-10 col-lg-8 mx-auto text-white">
            <h1 class="display-3 mb-0">${i18nextInstance.t("header.title")}</h1>
            <p class="lead">${i18nextInstance.t("header.paragraph")}</p>
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
                      placeholder="${i18nextInstance.t(
                        "form.input.placeholder"
                      )}"
                      autocomplete="off"
                    />
                    <label for="url-input">${i18nextInstance.t(
                      "form.input.label"
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
                    ${i18nextInstance.t("form.submit.text")}
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
      const form = document.querySelector(".rss-form");
      const formInput = document.querySelector("#url-input");
      const buttonForm = document.querySelector("button[type=submit]");

      // feeds
      // const uniqID = new UniqueIDGenerator();

      // input validate
      const urlValidationSchema = object({
        urlValue: string().url(),
        // urlValue: string().url(i18nextInstance.t("enter_valid_url")),
        // .min(1, i18nextInstance.t("enter_valid_url")),
        // .notOneOf(feedURLs)
      });

      const state = {
        reset() {
          this.form.input.urlValue = "";
          // this.form.submit.active = false;
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
          request: "successful", // waiting, sending, failed, successful
        },
        urls: [],
        feeds: [],
        posts: [],
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
        console.log(path);

        render(state, path, i18nextInstance);
        if (path === "form.input.urlValue") {
          validateInput(state.form.input).finally(() => {
            render(state, path, i18nextInstance);
          });
        }
      });

      // event listeners
      // input
      formInput.addEventListener("input", (e) => {
        watchedState.form.input.urlValue = e.target.value;

        console.log(state);
      });

      // submit
      buttonForm.addEventListener("click", (e) => {
        e.preventDefault();

        if (state.urls.some((url) => url.link === state.form.input.urlValue)) {
          watchedState.form.error = i18nextInstance.t("rss_exists");
          formInput.focus();
        } else {
          // watchedState.form.submit.active = false;
          watchedState.form.request = "sending";
          // axios
          const { urlValue } = state.form.input;
          const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
            urlValue
          )}`;
          axios
            .get(proxyUrl)
            .then((response) => {
              if (response.data.status.http_code === 404) {
                console.log("404");
                watchedState.form.request = "failed";
              } else {
                const parser = new DOMParser();
                console.log(
                  parser.parseFromString(response.data.contents, "text/xml")
                );
                const parsedRSS = parsRSS(response.data.contents);
                const urlID = uniqueIDGenerator.generateID();

                state.urls.push({
                  id: urlID,
                  link: urlValue,
                });

                // posts update
                const posts = [];
                parsedRSS.posts.forEach((post) => {
                  posts.push({
                    ...post,
                    id: uniqueIDGenerator.generateID(),
                    urlID,
                  });
                });
                watchedState.posts.unshift(...posts);

                // feeds update
                watchedState.feeds.unshift({
                  id: uniqueIDGenerator.generateID(),
                  urlID,
                  feedTitle: parsedRSS.feedTitle,
                  feedDescription: parsedRSS.feedDescription,
                });

                // watchedState.feeds = state.feeds;
                watchedState.form.request = "successful";

                state.reset();
                form.reset();

                // console.log(rssItems);
              }
            })
            .catch((error) => {
              watchedState.form.request = "failed";
              console.log(error);
            })
            .finally(() => {
              // state.reset();
              // form.reset();
              formInput.focus();
              console.log(state);
            });
        }
      });
    });
  });
