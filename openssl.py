# coding: utf-8

import tempfile
import commands
import shutil

from rutoken import models
from django.conf import settings


class OpensslVerifyException(Exception): pass




def verify(auth_sign, user_cert_path):
    """
        Обертка для команды openssl cms -verify.

        Параметры:
            auth_sign - аутентификационная строка
            user_cert_path - путь к файлу пользователя сертификата

        Возвращает результат рашивровки сообщения.
        Возбуждает исключение OpensslVerifyException в случае ошибки верификации.
    """

    # временный каталог для генерации промежуточных файлов
    tmpdir = tempfile.mkdtemp()

    # запишем строку auth_sign во временный файл
    auth_sign_path = tempfile.mktemp(dir=tmpdir, prefix='auth_', suffix='.sign')
    auth_sign_file = open(auth_sign_path, mode='w')
    auth_sign_file.write('-----BEGIN CMS-----\n')
    auth_sign_file.write(auth_sign.encode('utf-8'))
    auth_sign_file.write('-----END CMS-----\n')
    auth_sign_file.close()

    # временный для результата верификации
    auth_result_path = tempfile.mktemp(dir=tmpdir, prefix='auth_result_', suffix='.txt')

    # выполним верификацию
    cmd = 'cd %(pki_ca)s; %(openssl)s cms -engine gost -verify -in %(auth_sign_path)s -inform PEM -CAfile cacert.pem -out %(auth_result_path)s -nointern -certfile %(user_cert_path)s' % {
        'pki_ca': settings.PKI_CA_PATH,
        'openssl': settings.OPENSSL_BIN_PATH,
        'auth_sign_path': auth_sign_path,
        'auth_result_path': auth_result_path,
        'user_cert_path': user_cert_path,
    }
    status, output = commands.getstatusoutput(cmd)
    if status:  # если статус не 0 генерим ошибку
        raise OpensslVerifyException(u'Ошибка верификации:\n%s\n\n%s' % (cmd, output))


    # считаем содержимое в переменную
    auth_result_file = open(auth_result_path,"r")
    auth_result = auth_result_file.read()
    auth_result_file.close()

    # удалим временный каталог
    shutil.rmtree(tmpdir)

    return auth_result