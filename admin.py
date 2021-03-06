# coding: utf-8

from django.contrib import admin
from django.core.files.base import ContentFile
from rutoken import models
from rutoken import forms
from rutoken.views import login, token
from django.conf.urls import patterns, url


class CertificateRequest(admin.ModelAdmin):
    search_fields = ('common_name', 'user__username', )
    form = forms.CertificateRequest

    def save_model(self, request, obj, form, change):
        obj.save()
        # После сохранения pem_file.save() instance.save() делается еще раз.
        obj.pem_file.save("%s.pem" % obj.id, ContentFile(obj.pem_text.encode('utf-8')))

    def delete_model(self, request, obj):
        obj.pem_file.delete()
        super(CertificateRequest, self).delete_model(request, obj)

    def queryset(self, request):
        qs = super(CertificateRequest, self).queryset(request)
        qs = qs.filter(dd__isnull=True)
        return qs
admin.site.register(models.CertificateRequest, CertificateRequest)


class Certificate(admin.ModelAdmin):
    form = forms.Certificate

    def save_model(self, request, obj, form, change):
        obj.save()
        obj.pem_file.save('%s.pem' % obj.id, ContentFile(obj.pem_text.encode('utf-8')))

    def delete_model(self, request, obj):
        obj.pem_file.delete()
        super(Certificate, self).delete_model(request, obj)

admin.site.register(models.Certificate, Certificate)


def extend_get_urls(urls):
    def wrap():

        url_patterns = patterns('',
                                url(r'^token/', admin.site.admin_view(token))
        )
        return url_patterns + urls
    return wrap

admin.site.get_urls = extend_get_urls(admin.site.get_urls())
