/**
 * Обертка с дополнительными методами для манипулации с токеном
 * @constructor
 */
function CryptoPlugin() {
    this.pluginObject = document.getElementById("plugin-object");
}
CryptoPlugin.prototype = {
    is_valid: function(){
        return this.pluginObject && this.pluginObject.valid
    },

    refreshDevicesInfo: function(resultCallback, errorCallback) {
        var crypto = this;
        crypto.devicesInfo = {};

        this.pluginObject.enumerateDevices(
            enumerateCallback,
            errorCallback
        );

        function enumerateCallback(deviceIDs) {
            $.each(deviceIDs, function (i, deviceID) {
                refreshDeviceInfo(deviceID)
            })
        }

        /**
         * функция запрашивает всю информацию об устройстве. Результат помещает в devicesInfo
         * @param deviceID идентификатор устройства
         */
        function refreshDeviceInfo(deviceID) {
            crypto.devicesInfo[deviceID] = {
                label: '',
                model: ''
            };

            crypto.pluginObject.getDeviceLabel(
                deviceID,
                function(label) {
                    crypto.devicesInfo[deviceID]['label'] = label;
                    checkReady();
                },
                errorCallback
            );
            crypto.pluginObject.getDeviceModel(
                deviceID,
                function(model) {
                    crypto.devicesInfo[deviceID]['model'] = model;
                    checkReady();
                },
                errorCallback
            );
        }

        /**
         * Функция проверяет вся ди инфа об устроствах загружена.
         * Как только загрузка завершаена, вызывается колбек
         */
        function checkReady() {
            var allLoaded = true;

            $.each(crypto.devicesInfo, function (i, device) {
                if (!device['label'])   allLoaded = false;
                if (!device['model'])   allLoaded = false;
            });

            if (allLoaded)
                resultCallback(crypto.devicesInfo)
        }
    },

    /**
     * сортированный список устройств
     * @returns {Array}
     */
    getDeviceIDs: function() {
        if (!this.devicesInfo)
            throw "Нет информации об устройствах. Возможно следует сначала вызывать метод refreshDevicesInfo.";

        var deviceIDs = [];
        // сформируем массив идентификаторов
        for (k in this.devicesInfo) {
            if (this.devicesInfo.hasOwnProperty(k)) {
                deviceIDs.push(Number(k));
            }
        }
        // отсортируем его
        deviceIDs = deviceIDs.sort(function(a,b){ return Number(a)-Number(b) });

        return deviceIDs;
    }
};


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

    refreshDevices: function(devices_select) {
        var ui = this;
        devices_select = $(devices_select);
        devices_select.find('option').remove();
        devices_select.append('<option>Список обновляется...</option>');

        this.crypto.refreshDevicesInfo(refreshHandler, ui.errorCallback);


        function refreshHandler(devicesInfo) {
            devices_select.find('option').remove();
            $.each(ui.crypto.getDeviceIDs(), function(i, deviceID){
                var label = ui.crypto.devicesInfo[deviceID]['label'];
                var model = ui.crypto.devicesInfo[deviceID]['model'];
                devices_select.append('<option value="'+ deviceID +'">'+ label +' #'+ deviceID + ' ('+ model +')</option>');
            })
        }
    },

    report: function(messages, status) {
        status = status || 'info';

        // html-код описания ошибок
        var messages_li = "";
        $(messages).each(function(){
            messages_li += "<li>"+ this +"</li>";
        });

        // удалим старый бокс с ошибками (если есть)
        this.content_box.find('.alert').remove();

        //добавим новый
        var alert_html = $('<div class="alert alert-'+ status +'"><strong>Взаимодействие с ключом</strong><br><ul class="errorlist">'+ messages_li +'</ul></div>');
        this.content_box.prepend(alert_html);
    },

    // стандартный обработчик ошибки работы с ключом
    errorCallback: function(error_code) {
        this.report([error_code], 'error')
    }

};