# Generated by Django 4.1.5 on 2023-01-11 11:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='HandshakeResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ChatGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_group_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='ChatUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_user_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Classification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('classification', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Server',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('server_name', models.CharField(blank=True, default=None, max_length=100, null=True)),
                ('source_app_server_id', models.CharField(max_length=100)),
                ('auth_group', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='auth.group')),
            ],
        ),
        migrations.CreateModel(
            name='SourceApp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_app_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField(blank=True, default=None, null=True)),
                ('server', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.server')),
            ],
        ),
        migrations.AddField(
            model_name='server',
            name='source_app',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.sourceapp'),
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment_text', models.TextField()),
                ('manually_reported', models.BooleanField(default=False)),
                ('reviewed_by_moderator', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(blank=True, default=None, null=True)),
                ('source_app_comment_id', models.CharField(default='missing', max_length=100)),
                ('chat_group', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.chatgroup')),
                ('chat_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.chatuser')),
                ('classifier_classification', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='moderator_classification', to='HateMate_Backend_App.classification')),
                ('moderator_classification', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='classifier_classification', to='HateMate_Backend_App.classification')),
            ],
        ),
        migrations.AddField(
            model_name='chatuser',
            name='server',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.server'),
        ),
        migrations.AddField(
            model_name='chatgroup',
            name='server',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='HateMate_Backend_App.server'),
        ),
        migrations.AlterUniqueTogether(
            name='server',
            unique_together={('source_app', 'source_app_server_id')},
        ),
    ]