/**
 * Хелпер по работе с токеном в интерфейсе
 * @param param - параметры объекта:
 *      content_box - css-селектор контейнера с контентом, который должен реагировать на взаимодействие с ключом
 *      crypto - объект CryptoPlugin (необязательный)
 * @constructor
 */
function CryptoUI(param) {
    // обязательные параметры
    if (!param.content_box) throw 'Не задан параметр content_box"';

    this.content_box = $(param.content_box);
    this.crypto = param.crypto || new CryptoPlugin();

    // проверка валидности плагина
    if (!this.crypto.is_valid())
        this.report(["Ошибка создания объекта работы с ключом"], "error");
}

CryptoUI.prototype = {

    /**
     * Обновляет список устройств
     * @param devices_select - select-элемент, в который быдет выводится списо доступных устройств
     */
    refreshDevices: function(devices_select) {
        var ui = this;
        devices_select = $(devices_select);

        // обнулим текущий список
        devices_select.find('option').remove();
        devices_select.append('<option>Список обновляется...</option>');

        // запустим обновлений списка устройств
        this.crypto.refreshDevicesInfo(
            refreshCallback,
            errorCallback
        );

        /**
         * по результатам обновления инфы об устроствах
         * отрисуем список устройств
         */
        function refreshCallback(deviceIDs, devicesInfo) {
            devices_select.find('option').remove();
            $.each(ui.crypto.getDeviceIDs(), function(i, deviceID){
                var label = ui.crypto.devices[deviceID].label;
                var model = ui.crypto.devices[deviceID].model;
                devices_select.append('<option value="'+ deviceID +'">'+ label +' #'+ deviceID + ' ('+ model +')</option>');
            })
        }

        function errorCallback (errorCode) {
            ui.errorCallback(errorCode)
        }
    },


    /**
     * стандартный обработчик ошибки работы с ключом
     * @param error_code - под ошибки. преобразуется в соответствующее сообщение с помощью констант плагина
     */
    errorCallback: function(error_code) {
        var errorMsg = this.crypto.errorDescription[error_code];
        _report(this.content_box, [errorMsg], 'error')
    }

};

/**
 * служебная функция для вывод сообщений об ошибке. ее не следует использваоть на прямую.
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