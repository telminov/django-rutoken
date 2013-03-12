# coding: utf-8
from random import randint

from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from rutoken import models
from rutoken.openssl import authenticate

# название атрибута в которое сохранится рандомная серверная часть
SERVER_RANDOM = 'server_auth_random'

class Login(forms.Form):
    """
        Форма аутентификации с помощью ключа.
        (Частичный копипаст стандартной формы аутентификации джанги)
    """
    serial_number = forms.IntegerField(label=u'Серийный номер сертификата', required=True, widget=forms.HiddenInput)
    auth_sign = forms.CharField(
        label=u'Аутентификационная строка', required=True, widget=forms.HiddenInput,
        help_text=u'На сервере рандомно генерится строка, дополняется на клиенте рандомной частью, подписывается сертификатом с серийным номером указанном в serial_number и подпись помещаяется в поле'
    )

    # поля, нужные js-логике
    devices = forms.ChoiceField(label=u'Доступные устройства', choices=[])
    certs = forms.ChoiceField(label=u'Сертификаты на устройстве', choices=[])


    error_messages = {
        'invalid_login': _("Please enter a correct username and password. "
                           "Note that both fields are case-sensitive."),
        'no_cookies': _("Your Web browser doesn't appear to have cookies "
                        "enabled. Cookies are required for logging in."),
        'inactive': _("This account is inactive."),
    }

    class Media:
        js = (
            '%s/rutoken/js/crypto/plugin.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/device.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/cert.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/ui.js' % settings.STATIC_URL,
            '%s/rutoken/js/login.js' % settings.STATIC_URL,
        )

    def __init__(self, request=None, *args, **kwargs):
        """
        If request is passed in, the form will validate that cookies are
        enabled. Note that the request (a HttpRequest object) must have set a
        cookie with the key TEST_COOKIE_NAME and value TEST_COOKIE_VALUE before
        running this validation.
        """
        self.request = request
        self.user_cache = None
        super(Login, self).__init__(*args, **kwargs)

    def clean(self):
        serial_number = self.cleaned_data.get('serial_number')
        auth_sign = self.cleaned_data.get('auth_sign')

        if serial_number and auth_sign:
            server_random = self.request.session.get(SERVER_RANDOM)
            self.user_cache = authenticate(serial_number, server_random, auth_sign)

            if self.user_cache is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'])
            elif not self.user_cache.is_active:
                raise forms.ValidationError(self.error_messages['inactive'])
        self.check_for_test_cookie()
        return self.cleaned_data

    def set_server_random(self):
        """
            устанавливает рандомную часть аутентификационной строки в ссессию пользвоателя
        """
        server_random = randint(1000000000, 9999999999)
        self.request.session[SERVER_RANDOM] = server_random
        return server_random

    def check_for_test_cookie(self):
        if self.request and not self.request.session.test_cookie_worked():
            raise forms.ValidationError(self.error_messages['no_cookies'])

    def get_user_id(self):
        if self.user_cache:
            return self.user_cache.id
        return None

    def get_user(self):
        return self.user_cache


class CertificateRequest(forms.ModelForm):

    class Meta:
        model = models.CertificateRequest

    class Media:
        js = (
            '%s/rutoken/js/certificate_request.js' % settings.STATIC_URL,
        )


class Certificate(forms.ModelForm):

    class Meta:
        model = models.Certificate

    class Media:
        js = (
            '%s/rutoken/js/certificate.js' % settings.STATIC_URL,
        )