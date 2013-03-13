1. Настройка простейшего удостоверяющего центра (УЦ) с использование openssl.
    1.0 Установкить openssl
        В системе должна стоять версия openssl не меньше 1.0.1.
        Проверить можно с помошью команды
        openssl version

        Мне не удалось заставить корректно работать с рутокеном (например, подписывать запросы на сертификат)
        openssl версии "OpenSSL 1.0.0d 8 Feb 2011" (Mac OS 10.8).

        После установки на мак свежей версии с сайта http://www.openssl.org/source/ подпись сертификатов заработала корректно.
        "OpenSSL 1.0.1e 11 Feb 2013"

        Так же успешно работает версия под убунтой 12.04
        "OpenSSL 1.0.1 14 Mar 2012"


    1.1 Подготовка структуры файлов и катологов УЦ:
        В директории pki_ca:
            touch index.txt
            echo 01 > serial
            echo 01 > crlnumber
            mkdir request
            mkdir newcerts
            mkdir private
            mkdir working

    1.2 Настройка openssl.cnf:
        скопируйте openssl.cnf.sample в openssl.cnf
        замените в секции CA_default значение параметра dir "/YOUR_PROJECT_DIR/rutoken/pki_ca" на путь к диерктории pki_ca
        замените в секции req_distinguished_name значение параметра 0.organizationName_default "YOUR_ORG_NAME" на название вашей организации

    1.3 Создайте сертификат УЦ:
        В директории pki_ca:
            openssl req -config openssl.cnf -new -x509 -keyout private/cakey.pem -out cacert.pem -days 3650

            пример вывода:
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
                Common Name (eg, YOUR name) []:soft-way.biz
                Email Address []:telminov@soft-way.biz

    1.4 Список отзыва УЦ:
        В директории pki_ca:
            openssl ca -config openssl.cnf -gencrl -out crl.pem


2. Примеры работы в ручном режиме.
    2.1 Подпись запроса на сертификат:
        В диретории pki_ca/working:
            поместите тело запроса в файл request
                cat >working/request
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



