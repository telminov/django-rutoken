# coding: utf-8
from django.contrib.auth.backends import ModelBackend

from rutoken import openssl
from rutoken import models

class AuthException(Exception): pass


class AuthBackend(ModelBackend):

    def authenticate(self, cert_serial_number=None, server_random=None, auth_sign=None):
        """
            Параметры:
                cert_serial_number -серийный номер сертификата
                server_random - рандомная часть, которая была сгенерина на сервере и должна хранится в сесси пользователя на серверной стороне
                auth_sign - подпись сформированная ключом на клиенте. Содержит server_random и рандомное дополнение клиентом

            Возвращает пользователя, которому принадлежит сертификат
        """
        cert = models.Certificate.objects.get(serial_number=cert_serial_number, user__isnull=False, dd__isnull=True)

        # расшифруем уатентификационную строку
        auth_result = openssl.verify_auth(cert.pem_file.path, auth_sign)

        # если начало аутентификационной строки не совпадает со строкой сгенерированной на сервере,
        # то считаем пользователя не прошедшим аутентификацию
        if not auth_result.startswith(server_random):
            raise AuthException(u'Некорректная аутентификационная строка')

        return cert.user


