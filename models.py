# coding: utf-8
from django.db import models
from django.contrib.auth.models import User as AuthUser

class CertificateRequest(models.Model):
    """
        Запрос на сертификат
    """
    user = models.ForeignKey(AuthUser, verbose_name=u'Пользователь', null=True, related_name='cert_requests', help_text=u'Пользователь с которым может быть связан сертификат')

    country = models.CharField(max_length=2, verbose_name=u'Страна', default='RU', help_text=u'Двухбуквенный код страны')
    state = models.CharField(max_length=100, verbose_name=u'Область', default='Moscow', help_text=u'Обласить или регион')
    locality = models.CharField(max_length=100, verbose_name=u'Город', default='Moscow', help_text=u'Город или населенный пункт')
    org_name = models.CharField(max_length=255, verbose_name=u'Организация', help_text=u'Название организации в латинском эквиваленте')
    org_unit = models.CharField(max_length=255, verbose_name=u'Подразделение', blank=True, help_text=u'Название подразделения оргнанизации')
    common_name = models.CharField(max_length=255, verbose_name=u'Общее имя', unique=True, help_text=u'ФИО, логин или полностью определенное (FQDN) доменное имя')
    surname = models.CharField(max_length=255, verbose_name=u'Фамилия', blank=True)
    given_name = models.CharField(max_length=255, verbose_name=u'Имя', blank=True)
    email = models.CharField(max_length=255, verbose_name=u'e-mail', blank=True)
    title = models.CharField(max_length=255, verbose_name=u'Должность', blank=True)
    street_address = models.CharField(max_length=255, verbose_name=u'Фактичекий адрес', blank=True)
    postal_address = models.CharField(max_length=255, verbose_name=u'Юридический адрес', blank=True)
    inn = models.CharField(max_length=12, verbose_name=u'ИНН', blank=True)
    snils = models.CharField(max_length=12, verbose_name=u'СНИЛС', blank=True)
    ogrn = models.CharField(max_length=12, verbose_name=u'ОГРН', blank=True)

    pem = models.TextField(verbose_name=u'PEM', help_text=u'Текст запроса в формате PEM',)

    dc = models.DateTimeField(auto_now_add=True, verbose_name=u'Дата/время создания')
    dm = models.DateTimeField(auto_now=True, verbose_name=u'Дата/время последней модификации')
    dd = models.DateTimeField(null=True, verbose_name=u'Дата/время удаления', blank=True)


class Certificate(models.Model):
    """
        Сертификат
    """
    serial_number = models.AutoField(primary_key=True, verbose_name=u'Серийный номер', help_text=u'Серийны номер сертификата. Уникален в пределах удостоверяющего центра')

    request = models.ForeignKey(CertificateRequest, verbose_name=u'Запрос', null=True, help_text=u'Запрос на сертификат')
    user = models.ForeignKey(AuthUser, verbose_name=u'Пользователь', null=True, related_name='certificates', help_text=u'Пользователь с которым может быть связан сертификат')

    info = models.TextField(verbose_name=u'Информация')
    pem = models.TextField(verbose_name=u'PEM', help_text=u'Текст сертификата в формате PEM',)

    dc = models.DateTimeField(auto_now_add=True, verbose_name=u'Дата/время создания')
    dm = models.DateTimeField(auto_now=True, verbose_name=u'Дата/время последней модификации')
    dd = models.DateTimeField(null=True, verbose_name=u'Дата/время удаления', blank=True)

