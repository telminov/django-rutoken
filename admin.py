# coding: utf-8

from django.contrib import admin

from rutoken import models
from rutoken import forms


class CertificateRequest(admin.ModelAdmin):
    search_fields = ('common_name', 'user__username', )
    form = forms.CertificateRequest

    def queryset(self, request):
        qs = super(CertificateRequest, self).queryset(request)
        qs = qs.filter(dd__isnull=True)
        return qs

admin.site.register(models.CertificateRequest, CertificateRequest)