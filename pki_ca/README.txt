1. Настройка простейшего удостоверяющего центра (УЦ) с использование openssl.
    1.0 Установка openssl
        В системе должна стоять версия openssl не меньше 1.0.1.
        Проверить можно с помошью команды
        $ openssl version

        Мне не удалось заставить корректно работать с рутокеном (например, подписывать запросы на сертификат)
        openssl версии "OpenSSL 1.0.0d 8 Feb 2011" (Mac OS 10.8).

        После установки на мак свежей версии с сайта http://www.openssl.org/source/ подпись сертификатов заработала корректно.
        "OpenSSL 1.0.1e 11 Feb 2013"

        Так же успешно работает дефолтная версия под убунтой 12.04
        "OpenSSL 1.0.1 14 Mar 2012"

        Пример иснталяции из исходников:
            - качаем исходникик и разархивируем (в моем случае в диерторию ~/openssl-1.0.1e)
            - я хочу поставить openssl под работу с рутокеном и нехочу заменять дефолтную версию,
              поэтому интсалить буду в диреторию /MY_PROJECT_PATH/rutoken/pki_ca/openssl
            - конфигуруирую и инсталлирую по инструкции openssl-1.0.1e/INSTALL:
                openssl-1.0.1e $ ./config  --prefix=/Users/telminov/svn/neo/regitry/trunk/rutoken/pki_ca/openssl
                openssl-1.0.1e $ make
                openssl-1.0.1e $ make test
                openssl-1.0.1e $ make install
            Теперь у меня доступна отдельно от дефолтного openssl актуальная версия
                pki_ca $ openssl/bin/openssl version
                OpenSSL 1.0.1e 11 Feb 2013
            Далее в примерах для простоты я пишу вместо кастомной инсталляции openssl/bin/openssl дефолтную openssl.

    1.1 Подготовка структуры файлов и катологов УЦ:
            pki_ca $ touch index.txt
            pki_ca $ echo 01 > serial
            pki_ca $ echo 01 > crlnumber
            pki_ca $ mkdir request
            pki_ca $ mkdir newcerts
            pki_ca $ mkdir private
            pki_ca $ mkdir working

    1.2 Настройка openssl.cnf:
        скопируйте openssl.cnf.sample в openssl.cnf
        замените в секции CA_default значение параметра dir "/YOUR_PROJECT_DIR/rutoken/pki_ca" на путь к диерктории pki_ca
        замените в секции req_distinguished_name значение параметра 0.organizationName_default "YOUR_ORG_NAME" на название вашей организации

    1.3 Создайте сертификат УЦ:
        pki_ca $ openssl req -config openssl.cnf -new -x509 -keyout private/cakey.pem -out cacert.pem -days 3650
        Generating a 1024 bit RSA private key
        ............++++++
        ...............++++++
        writing new private key to 'private/cakey.pem'
        Enter PEM pass phrase:
        Verifying - Enter PEM pass phrase:
        -----
        You are about to be asked to enter information that will be incorporated
        into your certificate request.
        What you are about to enter is what is called a Distinguished Name or a DN.
        There are quite a few fields but you can leave some blank
        For some fields there will be a default value,
        If you enter '.', the field will be left blank.
        -----
        Country Name (2 letter code) [RU]:
        State or Province Name (full name) [Russian Federation]:
        Locality Name (eg, city) [Moscow]:
        Organization Name (eg, company) [SoftWay]:
        Organizational Unit Name (eg, section) []:
        Common Name (eg, YOUR name) []:
        Email Address []:

    1.4 Список отзыва УЦ:
        pki_ca $ openssl ca -config openssl.cnf -gencrl -out crl.pem


2. Примеры работы в ручном режиме.
    2.1 Подпись запроса на сертификат:
        поместите тело запроса в файл request
            pki_ca $ cat >working/request
            -----BEGIN CERTIFICATE REQUEST-----
            MIICLDCCAdkCAQAwgegxCzAJBgNVBAYTAlJVMRswGQYDVQQIExJSdXNzaWFuIEZl
            ZGVyYXRpb24xDzANBgNVBAcTBk1vc2NvdzEQMA4GA1UEChMHU29mdFdheTELMAkG
            A1UECxMCSVQxHzAdBgNVBAweFgRABDAENwRABDAEMQQ+BEIERwQ4BDoxETAPBgNV
            BAMTCHRlbG1pbm92MRswGQYDVQQEHhIEIgQ1BDsETAQ8BDgEPQQ+BDIxFTATBgNV
            BCoeDAQhBDUEQAQzBDUEOTEkMCIGCSqGSIb3DQEJARYVdGVsbWlub3ZAc29mdC13
            YXkuYml6MGMwHAYGKoUDAgITMBIGByqFAwICIwEGByqFAwICHgEDQwAEQMPIaqPk
            bqqlq63eTR0EReQy5DGxyBOPwQPr1tOjTIqrblWFIGciq4FQ7zfliQcYkYt7HpY2
            QhkmlXeobDwFnKqggYMwgYAGCSqGSIb3DQEJDjFzMHEwCwYDVR0PBAQDAgbAMCAG
            A1UdJQEB/wQWMBQGCCsGAQUFBwMEBggrBgEFBQcDAjATBgNVHSAEDDAKMAgGBiqF
            A2RxATArBgUqhQNkbwQiDCDQodCa0JfQmCAi0KDQo9Ci0J7QmtCV0J0g0K3QptCf
            IjAKBgYqhQMCAgMFAANBABi+PR6NaCXzDRSddNxsWNCDHCMhI4tZyQSAzm8VgFCA
            1GbTFeDrrUMo3sav+FS4CooxV/0O707LAorLydBw5nc=
            -----END CERTIFICATE REQUEST-----

        подпись
            pki_ca $ openssl ca -config openssl.cnf -in working/request -out working/newcert.pem -engine gost

        результат из файла working/newcert.pem импортировал на ключ

    2.2 Проверка аутентификационной строки:
        поместил аутентификационную строку в working/auth.sign
            pki_ca $ openssl cms -engine gost -verify -in working/auth.sign -inform PEM -CAfile cacert.pem -out working/verify_out.txt
            engine "gost" set.
            Verification successful
        в working/verify_out.txt получил строку начинающуюся со значения параметра salt, переданного в функцию authenticate плагина Rutoken WEB PKI Edition
            pki_ca $ cat working/verify_out.txt
            639470835146:d1:f1:02:04:a4:36:b3:d4:4e:4a:f9:68:de:86:8c:76:bd:5b:f6:51:f0:6c:5e:b0:4b:9f:a2:a9:9b:ba:1b