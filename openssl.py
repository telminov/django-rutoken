# coding: utf-8

import tempfile
import commands
import shutil
import pexpect

from django.conf import settings


class OpensslCreateCertException(Exception): pass
class OpensslVerifyException(Exception): pass

def create_cert(request_path):
    """
        Обрабатывает запрос на сертификат.
        Принимает путь к файлу запроса в формате PEM.
        Возвращает содержимое файла сертификату.
        Возбуждает исключение OpensslCreateCertException в случае ошибки формирования сертификата.
    """

    # временный каталог для генерации промежуточных файлов
    tmpdir = tempfile.mkdtemp()

    # путь к временному выходному файлу
    cert_path = tempfile.mktemp(dir=tmpdir, prefix='cert_', suffix='.pem')

    # сформируем сертификат
    cmd = '%(openssl)s ca -config openssl.cnf  -in %(request_path)s -out %(cert_path)s -engine gost' % {
        'pki_ca': settings.PKI_CA_PATH,
        'openssl': settings.OPENSSL_BIN_PATH,
        'request_path': request_path,
        'cert_path': cert_path,
    }
    child = pexpect.spawn('bash', args=['-c', cmd], cwd=settings.PKI_CA_PATH)
    # пароль к сертификату УЦ
    child.expect('Enter pass phrase for .*cakey.pem:')
    child.sendline(settings.PKI_CERT_PASSWD)
    # подтверждение корректности данных сертификата
    i = child.expect(['Sign the certificate?', pexpect.EOF])
    if i == 0:
        child.sendline('y')
    else:
        raise OpensslCreateCertException(u'Ошибка формирования сертификата:\n%s;\n%s' % (cmd, child.before))

    # если все гуд, будет предложено сохранить в базу ЦУ
    i = child.expect(['1 out of 1 certificate requests certified, commit?', pexpect.EOF])
    if i == 0:
        child.sendline('y')
    else:
        raise OpensslCreateCertException(u'Ошибка формирования сертификата:\n%s;\n%s' % (cmd, child.before))
    child.expect(pexpect.EOF)

    # считаем сертификат в переменную
    cert_file = open(cert_path, "r")
    cert_text = cert_file.read()
    cert_file.close()

    # удалим временный каталог
    shutil.rmtree(tmpdir)

    return cert_text


def verify_auth(cert_path, auth_sign):
    """
        Проверяет корректность аутентификационной строки с использованием указанного сертификата.
        С помощью функции можно установить что подпись была сформирована с испольхованием заданного сертификата.
        (Обертка для команды openssl cms -verify.)

        Параметры:
            cert_path - путь к файлу сертификата, с использование которого будет расшифрована аутентификационная строка
            auth_sign - аутентификационная строка

        Возвращает результат расшифровки сообщения.
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
    cmd = 'cd %(pki_ca)s; %(openssl)s cms -engine gost -verify -in %(auth_sign_path)s -inform PEM -CAfile cacert.pem -out %(auth_result_path)s -nointern -certfile %(cert_path)s' % {
        'pki_ca': settings.PKI_CA_PATH,
        'openssl': settings.OPENSSL_BIN_PATH,
        'auth_sign_path': auth_sign_path,
        'auth_result_path': auth_result_path,
        'cert_path': cert_path,
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


def verify_sign(cert_path, sign, data):
    """
        Метод проверяет что результат расшифровки подписи sign с использованием сертификата cert_path дает данные data

        Параметры:
            cert_path - путь к файлу сертификата, с использование которого будет проводится расшифровка
            sign - подпись, содержащая подписанные данные
            data - данные, которые нужно сравнить с содержимым подписи

        Вовращает результат проверки:
            True - подпись корректно
            False - результат не совпал

        Возбуждает исключение OpensslVerifyException в случае ошибки верификации.
    """
    # TODO: реализовать метод
    return True