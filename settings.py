# coding: utf-8
"""
    Настройки для прилоения rutoken.
    Следует импортировать в settings.py проекта например так:
        from rutoken.settings import *
"""

PKI_CA_PATH = '/Users/telminov/svn/neo/regitry/trunk/rutoken/pki_ca'
OPENSSL_BIN_PATH = '/Users/telminov/svn/neo/regitry/trunk/rutoken/pki_ca/openssl/bin/openssl'
AUTHENTICATION_BACKENDS  = ('rutoken.auth_backend.AuthBackend', )
PKI_CERT_PASSWD = '17254311'