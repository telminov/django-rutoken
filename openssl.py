# coding: utf-8

from rutoken import models

def authenticate(cert_serial_number, server_random, auth_sign):
    """
        Параметры:
            cert_serial_number -серийный номер сертификата
            server_random - рандомная часть, которая была сгенерина на сервере
            auth_sign - подпись сформированная ключом на клиенте. Содержит server_random и рандомное дополнение клиентом

        Возвращает пользователя, которому принадлежит сертификат
    """
    #TODO: реализовать проверку auth_sign
    cert = models.Certificate.objects.get(serial_number=cert_serial_number, user__isnull=False)
    return cert.user