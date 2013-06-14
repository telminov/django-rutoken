#coding: utf-8
from django.conf.urls import patterns, url
# from rutoken.admin import admin_site
urlpatterns = patterns('rutoken.views',
    url(r'^pem_request_popup/$', 'pem_request_popup'),
    url(r'^pem_cert_popup/$', 'pem_cert_popup'),
    url(r'^get_user_by_cert_request/$', 'get_user_by_cert_request'),
)
