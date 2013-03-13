$(function(){
    var devicesSelect = $('#id_devices');
    var certsSelect = $('#id_certs');
    var pinBtn = $('#id_pin');
    var submitBtn = $('form button[type=submit]');

    var crypto_ui = new CryptoUI({
        contentBox: '.box-container-toggle',
        devicesSelect: devicesSelect,
        certsSelect: certsSelect
    });

    // заблокируем до времени не нужные элементы формы
    certsSelect.attr('disabled', 'disabled');
    pinBtn.attr('disabled', 'disabled');
    submitBtn.attr('disabled', 'disabled');

    // модальное окно для ввода pin-кода
    pinBtn.click(openPINModal);

    crypto_ui.refreshDevices(deviceRefreshCallback);



    /**
     * окно ввода пин кода
     */
    function openPINModal(){
        crypto_ui.login({
            loginModal: $('#loginPINModal'),
            pinSuccessCallback: pinSuccessCallback
        });


        function pinSuccessCallback(){
            // заблокируем ввод пина чтобы не отвлекать пользователя
            pinBtn.attr('disabled', 'disabled');

            // вешаем обработчик аутентификции на сервере
            submitBtn.removeAttr('disabled');
            submitBtn.click(function (event) {
                event.preventDefault();
                authToServer();
            });
            submitBtn.focus();

            // если доступен только один сертификат, с ним сразу ломимся на сервер
            if (certsSelect.find('option').length == 1)
                authToServer();
        }
    }

    /**
     * обработчик успешного окончания обновлнеия списка устройств
     */
    function deviceRefreshCallback() {
        var selectedDeviceID = devicesSelect.val();

        if (!selectedDeviceID) return;  // если не оказалось устройств

        pinBtn.removeAttr('disabled');
        certsSelect.removeAttr('disabled');
        pinBtn.focus();
    }


    /**
     * метод инициирует вход на сервер по выбранному в текущий момент сертификату
     */
    function authToServer() {
        var selectedDeviceID = devicesSelect.val();
        var selectedCertID = certsSelect.val();
        submitBtn.attr('disabled', 'disabled');

        crypto_ui.infoReport(['Запрос на сервер аутентификации...']);

        // если выбрано устройство и сертификат
        if (selectedDeviceID && selectedCertID) {
            var device = crypto_ui.plugin.getDeviceByID(selectedDeviceID);
            var cert = device.getCertByID(selectedCertID);
            var serverRandom = $('#server_random').text();

            // сгенерируем на рутокене аутентификационную строку
            cert.genAuthToken(
                serverRandom,
                genAuthTokenCallback,
                function(errorCode) {crypto_ui.errorCallback(errorCode)}
            )

        } else {
            crypto_ui.errorReport(['Не указан сертификат'])
        }


        /**
         * С полученной аутентификационной строкой пойдем на сервер
         * @param authToken аутентификационная строка
         */
        function genAuthTokenCallback(authToken) {
            // просим сервер аутентифицировать нас
            $.ajax({
                type: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[type=hidden][name=csrfmiddlewaretoken]').val(),
                    serial_number: cert.serialNumber,
                    auth_sign: authToken
                },
                success: successHandler,
                error: errorHandler
            });


            /**
             * обработка ответа сервера на запрос аутентификации
             * @param data
             * @param textStatus
             * @param jqXHR
             */
            function successHandler(data, textStatus, jqXHR) {
                // проверим не вернул ли сервер сообщения об ишибках
                var errors = [];
                $(data).find('.alert-error .errorlist li').each(function(){
                    errors.push($(this).text());
                });

                // если нашлись ошибки выведем их
                if (errors.length) {
                    crypto_ui.errorReport(errors);

                    // обновим серверную часть аутентификационной строки
                    $('#server_random').text($(data).find('#server_random').text());
                } else {
                    // если ошибок нет, попытаемся средиректить на главную
                    window.location = '/';  // TODO: прикрутить парсинг параметра next
                }

                submitBtn.removeAttr('disabled');
            }

            /**
             * обработка ошибки ajax-запроса на сервер в попытке авторизоваться
             * @param jqXHR
             * @param textStatus
             * @param errorThrown
             */
            function errorHandler(jqXHR, textStatus, errorThrown) {
                // если есть jqXHR.status, значит сервер хоть что-то ответил. В противном случае похоже на отстутствие связи web-сервером
                var error;
                if (jqXHR.status)
                    error = 'Ошибка сервера аутентификации ('+ jqXHR.status +' - '+ errorThrown +')';
                else
                    error = 'Сервер не отвечает';
                crypto_ui.errorReport([error]);

                submitBtn.removeAttr('disabled');
            }
        }
    }
});
