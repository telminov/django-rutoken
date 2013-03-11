/**
 * Хелпер по работе с токеном в интерфейсе
 * @param param - параметры объекта:
 *      contentBox - css-селектор контейнера с контентом, который должен реагировать на взаимодействие с ключом
 *      devicesSelect - css-селектор списка устройств
 *      crypto - объект CryptoPlugin (необязательный)
 * @constructor
 */
function CryptoUI(param) {
    // обязательные параметры
    if (!param.contentBox) throw 'Не задан параметр contentBox"';

    this.contentBox = $(param.contentBox);
    this.devicesSelect = $(param.devicesSelect);
    this.crypto = param.crypto || new CryptoPlugin();

    // проверка валидности плагина
    if (!this.crypto.is_valid())
        this.report(["Ошибка создания объекта работы с ключом"], "error");
}

CryptoUI.prototype = {

    /**
     * Обновляет список устройств.
     * @param resultCallback - обработчик окончания обновления списка устройств
     */
    refreshDevices: function(resultCallback) {
        var ui = this;
        if (!ui.devicesSelect) throw 'Не задан параметр "devicesSelect"';

        // обнулим текущий список
        ui.devicesSelect.find('option').remove();
        ui.devicesSelect.append('<option>Список обновляется...</option>');

        // запустим обновлений списка устройств
        this.crypto.refreshDevicesInfo(
            refreshCallback,
            errorCallback
        );

        /**
         * по результатам обновления инфы об устроствах
         * отрисуем список устройств
         */
        function refreshCallback(deviceIDs, devices) {
            ui.devicesSelect.find('option').remove();

            $.each(deviceIDs, function(i, deviceID){
                var device = devices[deviceID];
                var option_html = '<option value="'+ device.id +'">'+ device.getExpandLabel() +'</option>';
                ui.devicesSelect.append(option_html);

                if (resultCallback)
                    resultCallback();
            })
        }

        function errorCallback (errorCode) {
            ui.errorCallback(errorCode)
        }
    },

    /**
     * логин на устройстве
     * @param loginModal - селектор модального bootstrap-окна (http://twitter.github.com/bootstrap/javascript.html#modals)
     */
    login: function(loginModal) {
        var ui = this;
        var selectedDeviceID = this.devicesSelect.val();

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

            var device = ui.crypto.devices[selectedDeviceID];
            device.login(pin, resultCallback, errorCallback);

            function resultCallback() {
                loginModal.modal('hide');
                ui.infoReport(['PIN-код успешно введен'])
            }

            function errorCallback(errorCode) {
                ui.errorCallback(errorCode, loginModalBody)
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
     * стандартный обработчик ошибки работы с ключом
     * @param errorCode - код ошибки. преобразуется в соответствующее сообщение с помощью констант плагина
     * @param contentBox - контейнер в который нужно выводить ошибку. Если не задан, будет использован атрибут contentBox объекта
     */
    errorCallback: function(errorCode, contentBox) {
        var errorMsg = this.crypto.errorDescription[errorCode];
        contentBox = contentBox || this.contentBox;

        _report(contentBox, [errorMsg], 'error')
    },

    /**
     * вывод сообщений об ошибках
     * @param errors - массив строк с описанием ошибок
     * @param contentBox - контейнер в который нужно выводить ошибку. Если не задан, будет использован атрибут contentBox объекта
     */
    errorReport: function(errors, contentBox) {
        contentBox = contentBox || this.contentBox;
        _report(contentBox, errors, 'error');
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