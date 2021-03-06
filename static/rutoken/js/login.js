$(function(){
    var devicesSelect = $('#id_devices');
    var certsSelect = $('#id_certs');
    var pinBtn = $('#id_pin');
    var submitBtn = $('form button[type=submit]');

    function toggleButtons(state){
        switch (state){
            case "openPin":
                pinBtn.removeAttr('disabled');
                submitBtn.attr('disabled','disabled');
                break;
            case "openSubmit":
                pinBtn.attr('disabled', 'disabled');
                submitBtn.removeAttr('disabled');
                break;
        }
    }

    var crypto_ui = new CryptoUI({
//        contentBox: '.box-container-toggle',
        contentBox: $("form"),
        devicesSelect: devicesSelect,
        certsSelect: certsSelect
    });
    $("<button/>", {
        class: 'btn button',
        type:'button',
        html:'<span class="icon-refresh"></span>',
        click: function(){
            crypto_ui.refreshDevices(deviceRefreshCallback);
        }
    }).insertAfter(devicesSelect);

    // заблокируем до времени не нужные элементы формы
    pinBtn.attr('disabled', 'disabled');
    submitBtn.attr('disabled', 'disabled');

    // модальное окно для ввода pin-кода
    pinBtn.click(openPINModal);

    crypto_ui.refreshDevices(deviceRefreshCallback);

    $("#id_devices").change(function(i,val){
        console.log("Change handler!!!");
        var ui = crypto_ui;
        ui.certsSelect.find('option').remove();

        var device = ui.plugin.devices[ui.devicesSelect.val()];
        $.each(device.getAllCerts(), function(i, cert) {
            var option_html = '<option value="'+ cert.id +'">'+ cert.getLabel() +'</option>';
            ui.certsSelect.append(option_html);
        });
        toggleButtons('openPin');
        crypto_ui.clearErrorReport();
    });


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
//            pinBtn.attr('disabled', 'disabled');

            // вешаем обработчик аутентификции на сервере
//            submitBtn.removeAttr('disabled');
            toggleButtons("openSubmit");
            submitBtn.click(function (event) {
                event.preventDefault();
                authToServer();
            });
            submitBtn.focus();

            // если доступен только один сертификат, с ним сразу ломимся на сервер
            if (certsSelect.find('option').length == 1){
                authToServer();
            }


        }
    }

    /**
     * обработчик успешного окончания обновлнеия списка устройств
     */
    function deviceRefreshCallback() {
        var selectedDeviceID = devicesSelect.val();

        if (!selectedDeviceID) return;  // если не оказалось устройств

        toggleButtons("openPin");
        pinBtn.focus();
        crypto_ui.clearErrorReport();

    }


    /**
     * метод инициирует вход на сервер по выбранному в текущий момент сертификату
     */
    function authToServer() {
        $("body").css("cursor", 'wait');
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
                function(errorCode) {
                    crypto_ui.errorCallback(errorCode);
                    toggleButtons("openSubmit");
                }
            )

        } else {
            crypto_ui.errorReport(['Не указан сертификат']);
        }


        /**
         * С полученной аутентификационной строкой пойдем на сервер
         * @param authToken аутентификационная строка
         *
         * //
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
                success: successAjaxHandler,
                error: errorHandler
            });

            /**
             *
            * обработка ответа сервера на запрос аутентификации
            **/
            function successAjaxHandler(data, textStatus, jqXHR){
             console.log(data, textStatus, jqXHR);
                if (data.errors){
                    alert(data.errors);
                    /* Если погадобится окошко с ошибкой
                    var ulWithErrors = $("<ul/>", {
                        class: "errorlist",
                    });
                    $.each(data.errors, function(key, error){
                        $("<li/>", {
                            text: error
                        }).appendTo(ulWithErrors);
                    });
                    $('<div/>').append(ulWithErrors).insertAfter($("h1"));
                    **/
                    crypto_ui.errorReport(data.errors);
                    $('#server_random').text(data.server_auth_random);
                    toggleButtons('openSubmit');
//                    submitBtn.removeAttr('disabled');

                }
                if (data.next){
                    console.log("Переходи на ", data.next);
                    window.location = data.next;
                }
                $("body").css("cursor", "auto");
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
                console.log('НЕУдачно отправили post');
                if (jqXHR.status)
                    error = 'Ошибка сервера аутентификации ('+ jqXHR.status +' - '+ errorThrown +')';
                else
                    error = 'Сервер не отвечает';
                crypto_ui.errorReport([error]);
                toggleButtons('openSubmit');
                $("body").css("cursor", "auto");
            }
        }
    }
});
