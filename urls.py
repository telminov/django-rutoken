#coding: utf-8
from django.conf.urls import patterns, url

urlpatterns = patterns('rutoken.views',
    url(r'^pem_request_popup/$', 'pem_request_popup'),
    url(r'^pem_cert_popup/$', 'pem_cert_popup'),
)