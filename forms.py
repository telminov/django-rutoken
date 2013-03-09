# coding: utf-8

from django import forms
from django.conf import settings

from rutoken import models


class CertificateRequest(forms.ModelForm):

    class Meta:
        model = models.CertificateRequest

    class Media:
        js = (
            '%s/rutoken/js/certificate_request.js' % settings.STATIC_URL,
        )


class Certificate(forms.ModelForm):

    class Meta:
        model = models.Certificate

    class Media:
        js = (
            '%s/rutoken/js/certificate.js' % settings.STATIC_URL,
        )