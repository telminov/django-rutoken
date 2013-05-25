# coding: utf-8
from random import randint
import re

from django import forms
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import authenticate

from rutoken import models
from rutoken import openssl
from rutoken.auth_backend import AuthException


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
    devices = forms.ChoiceField(label=u'Доступные устройства', choices=[], required=False)
    certs = forms.ChoiceField(label=u'Сертификаты на устройстве', choices=[], required=False)


    error_messages = {
        'invalid_login': u"Ошибка аутентификации.",
        'no_cookies': _("Your Web browser doesn't appear to have cookies "
                        "enabled. Cookies are required for logging in."),
        'inactive': _("This account is inactive."),
    }

    class Media:
        js = (
            '%s/rutoken/js/crypto/ui.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/plugin.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/device.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/cert.js' % settings.STATIC_URL,
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
        try:
            serial_number = self.cleaned_data.get('serial_number')
            auth_sign = self.cleaned_data.get('auth_sign')

            if serial_number and auth_sign:
                server_random = self.request.session.get(SERVER_RANDOM)
                self.user_cache = authenticate(cert_serial_number=serial_number, server_random=server_random, auth_sign=auth_sign)

                if self.user_cache is None:
                    raise forms.ValidationError(self.error_messages['invalid_login'])
                elif not self.user_cache.is_active:
                    raise forms.ValidationError(self.error_messages['inactive'])
            self.check_for_test_cookie()

        except openssl.OpensslVerifyException, ex:
            raise forms.ValidationError(u"Ошибка верификации аутентификационной строки (%s)" % ex)
        except AuthException, ex:
            raise forms.ValidationError(u"Ошибка аутентификации: %s" % ex)

        return self.cleaned_data

    def gen_server_auth_random(self):
        """
            Генерирует рандомную строку для аутентификации и сажает ее в сессию пользователя.
            Сгенерированная строка доступна через атрибут формы server_auth_random.
            Рандомная часть должна быть выведена в страницу аутентификации для генерации аутентифкационного токена на клиенте.
        """
        self.server_auth_random = str(randint(1000000000, 9999999999))
        self.request.session[SERVER_RANDOM] = self.server_auth_random

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
            'http://yandex.st/jquery/1.7.2/jquery.js',
            '%s/rutoken/js/crypto/ui.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/plugin.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/device.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/cert.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/key.js' % settings.STATIC_URL,
            '%s/rutoken/js/certificate_utils.js' % settings.STATIC_URL,
            '%s/rutoken/js/certificate_request.js' % settings.STATIC_URL,
        )

    def __init__(self, *args, **kwargs):
        super(CertificateRequest, self).__init__(*args, **kwargs)

        # инциализируем значениями из настроек
        if hasattr(settings, 'PKI_CA_COUNTRY'):
            self.fields['country'].initial = settings.PKI_CA_COUNTRY
        if hasattr(settings, 'PKI_CA_STATE'):
            self.fields['state'].initial = settings.PKI_CA_STATE
        if hasattr(settings, 'PKI_CA_ORG'):
            self.fields['org_name'].initial = settings.PKI_CA_ORG

        # селекторы для js-кода формы
        self.fields['pem_text'].widget.attrs['class'] = 'pem_text'

    def clean(self):
        cleaned_data = self.cleaned_data

        # запертим редактирование, если есть сертификат по запросу
        if self.instance.id and models.Certificate.objects.filter(request=self.instance.id).exists():
            raise forms.ValidationError(u'Нельзя изменить запрос - по нему уже существует сертификат')

        return cleaned_data


class Certificate(forms.ModelForm):
    serial_number = forms.IntegerField(label=u'Серийный номер', required=False)
    request = forms.ModelChoiceField(
        label=u'Запрос',
        required=True,
        queryset=models.CertificateRequest.objects.get_empty_query_set(),
        help_text=u'Запрос на сертификат'
    )

    class Meta:
        model = models.Certificate
        exclude = ('dd', 'pem', )

    class Media:
        js = (
            'http://yandex.st/jquery/1.7.2/jquery.js',
            '%s/rutoken/js/crypto/ui.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/plugin.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/device.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/cert.js' % settings.STATIC_URL,
            '%s/rutoken/js/crypto/key.js' % settings.STATIC_URL,
            '%s/rutoken/js/certificate_utils.js' % settings.STATIC_URL,
            '%s/rutoken/js/certificate.js' % settings.STATIC_URL,
        )

    def __init__(self, *args, **kwargs):
        super(Certificate, self).__init__(*args, **kwargs)

        # для созданны сертификатов, выобр ограничим собственным запросом
        if self.instance.id:
            self.fields['request'].queryset = models.CertificateRequest.objects.filter(certificate=self.instance)
        # для нового объекта показываем все запросы, не связанные еще сертификатами
        else:
            self.fields['request'].queryset = models.CertificateRequest.objects.filter(pem_file__isnull=False, certificate__isnull=True)


    def clean(self):
        cleaned_data = self.cleaned_data

        # запретим изменять сертификат
        if self.instance.id:
            raise forms.ValidationError(u'Нельзя изменять сформированный сертификат')

        # проверим, что пользователь сертификата совпадает с пользователем запроса
        user = cleaned_data.get('user')
        request = cleaned_data.get('request')
        if user and request and request.user != user:
            msg = u'Пользователь запроса не совпадает с пользователем сертификата'
            self._errors['user'] = self.error_class([msg])
            self._errors['request'] = self.error_class([msg])
            del cleaned_data['user']
            del cleaned_data['request']


        # если задан запрос, попробуем сформировать сертификат
        cert_request = cleaned_data.get('request')
        if cert_request:
            try:
                print cert_request.pem_file.path, cert_request.pem_file
                cert_text = openssl.create_cert(cert_request.pem_file.path)
                serial_number = re.search(r'Serial Number: (\d+)', cert_text).group(1)

                cleaned_data['serial_number'] = int(serial_number)
                cleaned_data['pem_text'] = cert_text

            except openssl.OpensslCreateCertException, ex:
                raise forms.ValidationError(ex)

        return cleaned_data

    def save(self, *args, **kwargs):
        self.instance.serial_number = self.cleaned_data['serial_number']
        self.instance.pem_text = self.cleaned_data['pem_text']
        cert = super(Certificate, self).save(*args, **kwargs)
        return cert