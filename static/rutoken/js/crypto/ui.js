/**
 * Хелпер по работе с токеном в интерфейсе
 * @param param - параметры объекта:
 *      contentBox - css-селектор контейнера с контентом, который должен реагировать на взаимодействие с ключом
 *      devicesSelect - css-селектор списка устройств (обязательный для работы метода refreshDevices без параметров. в противном случае можно не указывать)
 *      certsSelect - css-селектор списка сертификатов (необязательный)
 *      keysSelect - css-селектор списка ключей (необязательный)
 *      plugin - объект CryptoPlugin (необязательный)
 * @constructor
 */
function CryptoUI(param) {
    // обязательные параметры
    if (!param.contentBox) throw 'Not set parameter "contentBox"';

    this.contentBox = $(param.contentBox);
    this.devicesSelect = $(param.devicesSelect);
    this.certsSelect = $(param.certsSelect);
    this.keysSelect = $(param.keysSelect);
    this.plugin = param.plugin || new CryptoPlugin();

    // проверка валидности плагина
    if (!this.plugin.is_valid())
        this.report(["Ошибка создания объекта работы с ключом"], "error");
}

CryptoUI.prototype = {

    /**
     * Обновляет список устройств.
     * @param resultCallback - обработчик окончания обновления списка устройств
     */
    refreshDevices: function(resultCallback, devicesSelect) {
        var ui = this;
        devicesSelect = devicesSelect || ui.devicesSelect;
        if (!devicesSelect) throw 'Not set parameter "devicesSelect"';

        // обнулим текущий список
        devicesSelect.find('option').remove();
        devicesSelect.append('<option>Список обновляется...</option>');

        // запустим обновлений списка устройств
        this.plugin.refreshDevicesInfo(
            refreshCallback,
            errorCallback
        );

        /**
         * по результатам обновления инфы об устроствах
         * отрисуем список устройств
         */
        function refreshCallback(devices) {
            // обновим список устройств
            devicesSelect.find('option').remove();
            $.each(devices, function(i, device){
                var option_html = '<option value="'+ device.id +'">'+ device.getExpandLabel() +'</option>';
                devicesSelect.append(option_html);
            });

            // обновим список сертификатов, если задан селектор сертификатов и обнаружены устройства
            if (ui.certsSelect.length && devices.length) {
                ui.certsSelect.find('option').remove();
                $.each(devices[0].getAllCerts(), function(i, cert) {
                    var option_html = '<option value="'+ cert.id +'">'+ cert.getLabel() +'</option>';
                    ui.certsSelect.append(option_html);
                })
            }

            if (resultCallback)
                resultCallback();
        }

        function errorCallback (errorCode) {
            ui.errorCallback(errorCode)
        }
    },

    /**
     * логин на устройстве
     * @param param параметры:
     *      loginModal - селектор модального bootstrap-окна (http://twitter.github.com/bootstrap/javascript.html#modals)
     *      devicesSelect - css-селектор списка устройств, если не задан, то будет использован атрибу devicesSelect объекта
     *      pinSuccessCallback - обаботчик успешного ввода PIN-кода. Принимает объект устройства, на которое был осуществлен вход.
     */
    login: function(param) {
        var ui = this;

        var loginModal = param.loginModal;
        var devicesSelect = param.devicesSelect || ui.devicesSelect;
        var selectedDeviceID = devicesSelect.val();

        if (!selectedDeviceID) {
            this.errorReport(["Не выбрано устройство"]);
            return;
        }

        var pinInput = loginModal.find('input:first');
        var primaryButton = loginModal.find('.btn-primary');

        // откроем окно
        loginModal.modal();
        loginModal.on('shown', shownHandler);
        loginModal.on('hidden', hiddenHandler);
        loginModal.find(':header').first().text(device.getExpandLabel());

        // повесим обработчики ввода пароля
        primaryButton.click(pinHandler);
        pinInput.keypress(
            function(e){
                if (e.keyCode == 13)        // ввод Enter
                    pinHandler()
            }
        );


        function shownHandler() {
            pinInput.focus();
        }

        /**
         * снимем обработчики ввода пин-кода и очистим поле ввода
         */
        function hiddenHandler() {
            primaryButton.unbind('click');
            pinInput.unbind('keypress');
            pinInput.val('');
        }

        function pinHandler() {
            var loginModalBody = loginModal.find('.modal-body');

            var pin = pinInput.val();
            if (!pin) {
                ui.errorReport(['Не задан PIN-код'], loginModalBody);
                return;
            }

            var device = ui.plugin.devices[selectedDeviceID];
            device.login(pin, resultCallback, errorCallback);


            /**
             * успешный логин на устройство
             */
            function resultCallback() {
                loginModal.modal('hide');
                ui.infoReport(['PIN-код успешно введен']);

                // вызовем обработчик успешного входа
                if (param.pinSuccessCallback)
                    param.pinSuccessCallback(device);
            }

            function errorCallback(errorCode) {
                ui.errorCallback(errorCode, loginModalBody);
                pinInput.select();
            }
        }


    },


    /**
     * вывод информационного сообщения
     * @param messages - массив строк с сообщениями
     * @param contentBox - контейнер в который нужно выводить инфомрацию. Если не задан, будет использован атрибут contentBox объекта
     */
    infoReport: function(messages, contentBox) {
        contentBox = contentBox || this.contentBox;
        _report(contentBox, messages, 'info');
    },


    /**
     * вывод сообщений об ошибках
     * @param errors - массив строк с описанием ошибок
     * @param contentBox - контейнер в который нужно выводить ошибку. Если не задан, будет использован атрибут contentBox объекта
     */
    errorReport: function(errors, contentBox) {
        contentBox = contentBox || this.contentBox;
        _report(contentBox, errors, 'error');
    },

    /**
     * стандартный обработчик ошибки работы с ключом
     * @param errorCode - код ошибки. преобразуется в соответствующее сообщение с помощью констант плагина
     * @param contentBox - контейнер в который нужно выводить ошибку. Если не задан, будет использован атрибут contentBox объекта
     */
    errorCallback: function(errorCode, contentBox) {
        var errorMsg = this.plugin.errorDescription[errorCode];
        contentBox = contentBox || this.contentBox;

        _report(contentBox, [errorMsg], 'error')
    }
};

/**
 * Служебная функция для вывода сообщений об ошибке. Ее не следует использваоть напрямую.
 * Вместо этого нужно вызывать методы CryptoUI.errorCallback и прочие.
 * @param container - элемент интерфейса, в начало которого будет добалвено сообщение об ошибке
 * @param messages - список сообщений
 * @param status - статус сообщение: info, error и т.д. (в соответствии с bootstrap)
 * @private
 */
function _report(container, messages, status) {
    status = status || 'info';

    // html-код описания ошибок
    var messages_li = "";
    $.each(messages, function(i, msg){
        messages_li += "<li>"+ msg +"</li>";
    });

    // удалим старый бокс с ошибками (если есть)
    container.find('.alert').remove();

    //добавим новый
    var alert_html = $('<div class="alert alert-'+ status +'"><strong>Взаимодействие с ключом</strong><br><ul class="errorlist">'+ messages_li +'</ul></div>');
    container.prepend(alert_html);
}