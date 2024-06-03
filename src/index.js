import "./scss/styles.scss";
import * as bootstrap from "bootstrap";
import { object, string } from "yup";
import onChange from "on-change";
import { render } from "./view.js";
import i18n from "i18next";
import { ru } from "./locales/index.js";

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
          </div>
        </div>
      </section>
    </main>`;

      document.body.innerHTML = html;

      // MODEL
      const form = document.querySelector(".rss-form");
      const formInput = document.querySelector("#url-input");
      const buttonForm = document.querySelector("button[type=submit]");

      // feeds
      const feedURLs = [];

      // input validate
      const urlValidationSchema = object({
        urlValue: string()
          .url(i18nextInstance.t("enter_valid_url"))
          .min(1, i18nextInstance.t("enter_valid_url")),
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
        console.log(path);

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

        console.log(state);
      });

      buttonForm.addEventListener("click", (e) => {
        e.preventDefault();

        if (feedURLs.includes(state.form.input.urlValue)) {
          watchedState.form.error = i18nextInstance.t("rss_exists");
          formInput.focus();
        } else {
          watchedState.form.submit.active = false;
          feedURLs.push(state.form.input.urlValue);
          state.reset();
          form.reset();
          formInput.focus();
          // Make the submit button inactive
        }

        console.log(feedURLs, state);
      });
    });
  });
