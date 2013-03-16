# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CertificateRequest'
        db.create_table('rutoken_certificaterequest', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='cert_requests', null=True, to=orm['auth.User'])),
            ('country', self.gf('django.db.models.fields.CharField')(default='RU', max_length=2)),
            ('state', self.gf('django.db.models.fields.CharField')(default='Moscow', max_length=100)),
            ('locality', self.gf('django.db.models.fields.CharField')(default='Moscow', max_length=100)),
            ('org_name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('org_unit', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('common_name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('surname', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('given_name', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('email', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('street_address', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('postal_address', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('inn', self.gf('django.db.models.fields.CharField')(max_length=12, blank=True)),
            ('snils', self.gf('django.db.models.fields.CharField')(max_length=12, blank=True)),
            ('ogrn', self.gf('django.db.models.fields.CharField')(max_length=12, blank=True)),
            ('pem_text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('pem_file', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True)),
            ('dc', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('dm', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('dd', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal('rutoken', ['CertificateRequest'])

        # Adding model 'Certificate'
        db.create_table('rutoken_certificate', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('serial_number', self.gf('django.db.models.fields.IntegerField')(unique=True)),
            ('request', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rutoken.CertificateRequest'], null=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='certificates', null=True, to=orm['auth.User'])),
            ('info', self.gf('django.db.models.fields.TextField')()),
            ('pem', self.gf('django.db.models.fields.files.FileField')(max_length=100)),
            ('dc', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('dm', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('dd', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal('rutoken', ['Certificate'])


    def backwards(self, orm):
        # Deleting model 'CertificateRequest'
        db.delete_table('rutoken_certificaterequest')

        # Deleting model 'Certificate'
        db.delete_table('rutoken_certificate')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'rutoken.certificate': {
            'Meta': {'object_name': 'Certificate'},
            'dc': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dd': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'dm': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {}),
            'pem': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            'request': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rutoken.CertificateRequest']", 'null': 'True'}),
            'serial_number': ('django.db.models.fields.IntegerField', [], {'unique': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'certificates'", 'null': 'True', 'to': "orm['auth.User']"})
        },
        'rutoken.certificaterequest': {
            'Meta': {'ordering': "('-dc',)", 'object_name': 'CertificateRequest'},
            'common_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'country': ('django.db.models.fields.CharField', [], {'default': "'RU'", 'max_length': '2'}),
            'dc': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dd': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'dm': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'given_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inn': ('django.db.models.fields.CharField', [], {'max_length': '12', 'blank': 'True'}),
            'locality': ('django.db.models.fields.CharField', [], {'default': "'Moscow'", 'max_length': '100'}),
            'ogrn': ('django.db.models.fields.CharField', [], {'max_length': '12', 'blank': 'True'}),
            'org_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'org_unit': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'pem_file': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True'}),
            'pem_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'postal_address': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'snils': ('django.db.models.fields.CharField', [], {'max_length': '12', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'default': "'Moscow'", 'max_length': '100'}),
            'street_address': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'surname': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'cert_requests'", 'null': 'True', 'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['rutoken']