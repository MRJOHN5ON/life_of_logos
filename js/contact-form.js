/**
 * Life of Logos contact form — EmailJS (same account as mrjohn5on.github.io)
 */
(function () {
    var SERVICE_ID = 'service_f9dkmsd';
    var TEMPLATE_ID = 'template_w0fo8ha';
    var PUBLIC_KEY = 'QCTTc-Jm31CfWV3mS';

    function initEmailJS() {
        if (typeof emailjs === 'undefined') return;
        emailjs.init(PUBLIC_KEY);
    }

    function getEl(id) {
        return document.getElementById(id);
    }

    function validate(form) {
        var name = getEl(form.nameId || 'name');
        var email = getEl(form.emailId || 'email');
        var message = getEl(form.messageId || 'message');
        if (!name || !email || !message) return { ok: false, error: 'Form is missing required fields.' };

        var nameVal = name.value.trim();
        var emailVal = email.value.trim();
        var messageVal = message.value.trim();

        if (!nameVal || !emailVal || !messageVal) {
            return { ok: false, error: 'Please fill in all required fields.' };
        }

        if (nameVal.length < 2) {
            return { ok: false, error: 'Please enter your name.' };
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            return { ok: false, error: 'Please enter a valid email address.' };
        }

        var phoneEl = form.phoneId ? getEl(form.phoneId) : null;
        var phoneVal = phoneEl ? phoneEl.value.trim() : '';
        var fullMessage = messageVal;
        if (phoneVal) {
            fullMessage += '\n\nCallback phone: ' + phoneVal;
        }
        if (form.sourceLabel) {
            fullMessage += '\n\nSent from: ' + form.sourceLabel;
        }

        return {
            ok: true,
            params: {
                name: nameVal,
                email: emailVal,
                message: fullMessage
            }
        };
    }

    function setButtonState(btn, state) {
        if (!btn) return;
        if (state === 'sending') {
            btn.disabled = true;
            btn.dataset.lolOriginalText = btn.textContent;
            btn.textContent = 'Sending…';
        } else if (state === 'idle') {
            btn.disabled = false;
            if (btn.dataset.lolOriginalText) {
                btn.textContent = btn.dataset.lolOriginalText;
            }
        }
    }

    window.lolSendContact = function (options) {
        options = options || {};
        var formEl = options.formEl || document.getElementById('contact-form');
        var btn = options.submitBtn || (formEl && formEl.querySelector('[type="submit"]'));

        var result = validate({
            nameId: options.nameId || 'name',
            emailId: options.emailId || 'email',
            phoneId: options.phoneId || 'phone',
            messageId: options.messageId || 'message',
            sourceLabel: options.sourceLabel || 'Life of Logos'
        });

        if (!result.ok) {
            alert(result.error);
            return;
        }

        if (typeof emailjs === 'undefined') {
            alert('Email service is still loading. Try again in a second.');
            return;
        }

        setButtonState(btn, 'sending');

        emailjs.send(SERVICE_ID, TEMPLATE_ID, result.params)
            .then(function () {
                alert('Message sent — I\'ll get back to you soon!');
                if (formEl) formEl.reset();
                setButtonState(btn, 'idle');
            })
            .catch(function (err) {
                console.error('EmailJS failed', err);
                alert('Something went wrong sending your message. Email me at ryleyjohnsonemail@gmail.com or try again.');
                setButtonState(btn, 'idle');
            });
    };

    function bindForm(options) {
        var formEl = document.getElementById(options.formId || 'contact-form');
        if (!formEl) return;

        formEl.addEventListener('submit', function (e) {
            e.preventDefault();
            window.lolSendContact({
                formEl: formEl,
                sourceLabel: options.sourceLabel,
                nameId: options.nameId,
                emailId: options.emailId,
                phoneId: options.phoneId,
                messageId: options.messageId
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initEmailJS();
            bindForm(window.lolContactFormConfig || {});
        });
    } else {
        initEmailJS();
        bindForm(window.lolContactFormConfig || {});
    }
})();
