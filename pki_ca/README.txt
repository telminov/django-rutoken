Настройка простейшего удостоверяющего центра (УЦ) с использование openssl.

Подготовка структуры файлов и катологов УЦ:
    В директории pki_ca:
        touch index.txt
        echo 01 > serial
        echo 01 > crlnumber
        mkdir request
        mkdir private

Настройка openssl.cnf:
    скопируйте openssl.cnf.sample в openssl.cnf
    замените в секции CA_default значение параметра dir "/YOUR_PROJECT_DIR/rutoken/pki_ca" на путь к диерктории pki_ca
    замените в секции req_distinguished_name значение параметра 0.organizationName_default "YOUR_ORG_NAME" на название вашей организации

Создайте сертификат УЦ:
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

Список отзыва УЦ:
    В директории pki_ca:
        openssl ca -config openssl.cnf -gencrl -out crl.pem