(function () {
  "use strict";

  if (window.lottie && !window.lottie.__leadtechSafeLoader) {
    var originalLoadAnimation = window.lottie.loadAnimation.bind(window.lottie);
    window.lottie.loadAnimation = function (options) {
      if (!options || !options.container) return null;
      return originalLoadAnimation(options);
    };
    window.lottie.__leadtechSafeLoader = true;
  }

  function setMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = "form-message " + type;
  }

  function submitForm(form, messageElement, submitButton, successMessage) {
    var formData = new FormData(form);
    var originalText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (data) {
            throw new Error(
              data.errors && data.errors[0]
                ? data.errors[0].message
                : "Submission failed. Please try again."
            );
          });
        }
        form.reset();
        setMessage(messageElement, successMessage, "text-green-500");
      })
      .catch(function (error) {
        setMessage(messageElement, error.message || "Network error. Please try again.", "text-red-500");
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
  }

  function validateContact(form) {
    var requiredFields = form.querySelectorAll("[required]");
    for (var i = 0; i < requiredFields.length; i += 1) {
      if (!requiredFields[i].value.trim()) return "Please fill in all required fields.";
    }
    var email = form.querySelector('input[type="email"]');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll('form[data-endpoint="forms"], form[action="/api/forms"]');

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var isNewsletter = form.id === "newsletter-form";
        var messageElement = form.querySelector(".form-message") ||
          document.getElementById(isNewsletter ? "newsletter-form-message" : "contact-form-message") ||
          document.getElementById("callback-form-message");
        var submitButton = form.querySelector('button[type="submit"]');
        var error = isNewsletter ? "" : validateContact(form);

        setMessage(messageElement, "", "form-message");
        if (error) {
          setMessage(messageElement, error, "text-red-500");
          return;
        }

        submitForm(
          form,
          messageElement,
          submitButton,
          isNewsletter ? "Thanks for subscribing!" : "Thank you! We will get back to you shortly."
        );
      }, true);
    });
  });
}());