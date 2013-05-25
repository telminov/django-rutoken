# coding: utf-8
"""
    Настройки для прилоения rutoken.
    Следует импортировать в settings.py проекта например так:
        from rutoken.settings import *

    В настройках проекта импортированные переменные следует переопределить
"""

# PKI_CA_PATH = '/Users/telminov/svn/neo/regitry/trunk/rutoken/pki_ca'
PKI_CA_PATH = '/home/g10k/svn_neo/mis_mm/branches/1105/rutoken/pki_ca'
# OPENSSL_BIN_PATH = '/Users/telminov/svn/neo/regitry/trunk/rutoken/pki_ca/openssl/bin/openssl'
OPENSSL_BIN_PATH = '/usr/bin/openssl'

# пароль к сертификату УЦ
# PKI_CERT_PASSWD = '17254311'
PKI_CERT_PASSWD = 'soft'
# policy_match удостоверяющего центра
PKI_CA_COUNTRY = 'RU'
PKI_CA_STATE = 'Russian Federation'
PKI_CA_ORG = 'SoftWay'

AUTHENTICATION_BACKENDS  = ('rutoken.auth_backend.AuthBackend', 'django.contrib.auth.backends.ModelBackend' )
