# coding: utf-8
from django.db import models
from django.contrib.auth.models import User as AuthUser
from django.core.files.base import ContentFile

class CertificateRequest(models.Model):
    """
        Запрос на сертификат
    """
    user = models.ForeignKey(AuthUser, verbose_name=u'Пользователь', null=True, related_name='cert_requests', on_delete=models.SET_NULL, help_text=u'Пользователь с которым может быть связан сертификат')

    country = models.CharField(max_length=2, verbose_name=u'Страна', default='RU', help_text=u'Двухбуквенный код страны')
    state = models.CharField(max_length=100, verbose_name=u'Область', default='Moscow', help_text=u'Область или регион')
    locality = models.CharField(max_length=100, verbose_name=u'Город', default='Moscow', help_text=u'Город или населенный пункт')
    org_name = models.CharField(max_length=255, verbose_name=u'Организация', help_text=u'Название организации в латинском эквиваленте')
    org_unit = models.CharField(max_length=255, verbose_name=u'Подразделение', blank=True, help_text=u'Название подразделения оргнанизации')
    common_name = models.CharField(max_length=255, verbose_name=u'Общее имя', help_text=u'ФИО, логин или полностью определенное (FQDN) доменное имя')
    surname = models.CharField(max_length=255, verbose_name=u'Фамилия', blank=True)
    given_name = models.CharField(max_length=255, verbose_name=u'Имя', blank=True)
    email = models.CharField(max_length=255, verbose_name=u'e-mail', blank=True)
    title = models.CharField(max_length=255, verbose_name=u'Должность', blank=True)
    street_address = models.CharField(max_length=255, verbose_name=u'Фактичекий адрес', blank=True)
    postal_address = models.CharField(max_length=255, verbose_name=u'Юридический адрес', blank=True)
    inn = models.CharField(max_length=12, verbose_name=u'ИНН', blank=True)
    snils = models.CharField(max_length=12, verbose_name=u'СНИЛС', blank=True)
    ogrn = models.CharField(max_length=12, verbose_name=u'ОГРН', blank=True)

    pem_text = models.TextField(verbose_name=u'Тело запроса', help_text=u'Текст запроса в формате PEM', blank=True)
    pem_file = models.FileField(upload_to='rutoken/request_certs', verbose_name=u'PEM', help_text=u'Файл завроса в формате PEM', editable=False, null=True)

    dc = models.DateTimeField(auto_now_add=True, verbose_name=u'Дата/время создания')
    dm = models.DateTimeField(auto_now=True, verbose_name=u'Дата/время последней модификации')
    dd = models.DateTimeField(null=True, verbose_name=u'Дата/время удаления', blank=True, editable=False)

    class Meta:
        verbose_name = u'Запрос на сертификат'
        verbose_name_plural = u'Запросы на сертификат'
        ordering = ('-dc', )

    def __unicode__(self):
        return u'%s от %s' % (self.common_name, self.dc.date())


class Certificate(models.Model):
    """
        Сертификат
    """
    serial_number = models.IntegerField(unique=True, verbose_name=u'Серийный номер', help_text=u'Серийны номер сертификата. Уникален в пределах удостоверяющего центра')

    request = models.OneToOneField(CertificateRequest, verbose_name=u'Запрос', null=True, related_name='certificate', help_text=u'Запрос на сертификат')
    user = models.ForeignKey(AuthUser, verbose_name=u'Пользователь', null=True, related_name='certificates', on_delete=models.SET_NULL, help_text=u'Пользователь с которым может быть связан сертификат')

    pem_text = models.TextField(verbose_name=u'Тело сертификата', help_text=u'Текст сертификата в формате PEM', blank=True)
    pem_file = models.FileField(upload_to='rutoken/certs', verbose_name=u'PEM', editable=False, null=True, help_text=u'Файл сертификата в формате PEM')


    dc = models.DateTimeField(auto_now_add=True, verbose_name=u'Дата/время создания')
    dm = models.DateTimeField(auto_now=True, verbose_name=u'Дата/время последней модификации')
    dd = models.DateTimeField(null=True, verbose_name=u'Дата/время удаления', blank=True)


    class Meta:
        verbose_name = u'Сертификат'
        verbose_name_plural = u'Сертификаты'
        ordering = ('-dc', )


    def __unicode__(self):
        return u'%s' % (self.serial_number,)
