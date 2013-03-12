/**
 * Обертка с дополнительными методами для манипулации с токеном
 * @constructor
 */
function CryptoPlugin() {
    this.pluginObject = document.getElementById("plugin-object");
    this._set_constants();
}
CryptoPlugin.prototype = {
    pluginObject: null,
    devices: [],
    errorCodes: null,
    errorDescription: [],

    is_valid: function(){
        return this.pluginObject && this.pluginObject.valid
    },

    /**
     * служебный метод для установки констант плагина
     * @private
     */
    _set_constants: function() {
        this.errorCodes = this.pluginObject.errorCodes;
        this.errorDescription[this.errorCodes.UNKNOWN_ERROR] = "Неизвестная ошибка";
        this.errorDescription[this.errorCodes.BAD_PARAMS] = "Неправильные параметры";
        this.errorDescription[this.errorCodes.DEVICE_NOT_FOUND] = "Устройство не найдено";
        this.errorDescription[this.errorCodes.RNG_ERROR] = "Ошибка датчика случайных чисел";
        this.errorDescription[this.errorCodes.CERTIFICATE_CATEGORY_BAD] = "Недопустимый тип сертификата";
        this.errorDescription[this.errorCodes.CERTIFICATE_EXISTS] = "Сертификат уже существует на устройстве";
        this.errorDescription[this.errorCodes.CERTIFICATE_INVALID] = "Не удалось разобрать сертификат";
        this.errorDescription[this.errorCodes.PKCS11_LOAD_FAILED] = "Не удалось загрузить PKCS#11 библиотеку";
        this.errorDescription[this.errorCodes.NOT_ENOUGH_MEMORY] = "Недостаточно памяти";
        this.errorDescription[this.errorCodes.PIN_INVALID] = "Неверный PIN-код";
        this.errorDescription[this.errorCodes.PIN_LENGTH_INVALID] = "Некорректная длина PIN-кода";
        this.errorDescription[this.errorCodes.PIN_INCORRECT] = "Некорректный PIN-код";
        this.errorDescription[this.errorCodes.PIN_LOCKED] = "PIN-код заблокирован";
        this.errorDescription[this.errorCodes.TOKEN_NOT_PRESENT] = "Токен не найден";
        this.errorDescription[this.errorCodes.USER_NOT_LOGGED_IN] = "Выполните вход на устройство";
        this.errorDescription[this.errorCodes.KEY_NOT_FOUND] = "Соответствующая сертификату ключевая пара не найдена";
        this.errorDescription[this.errorCodes.KEY_ID_NOT_UNIQUE] = "Идентификатор ключевой пары не уникален";
        this.errorDescription[this.errorCodes.CERTIFICATE_NOT_FOUND] = "Сертификат не найден";
        this.errorDescription[this.errorCodes.CERTIFICATE_ID_NOT_UNIQUE] = "Идентификатор сертификата не уникален";
        this.errorDescription[this.errorCodes.TOKEN_INVALID] = "Ошибка чтения/записи устройства. Возможно, устройство было извлечено. Попробуйте выполнить enumerate";
        this.errorDescription[this.errorCodes.BASE64_DECODE_FAILED] = "Ошибка декодирования даных из BASE64";
        this.errorDescription[this.errorCodes.PEM_ERROR] = "Ошибка разбора PEM";
        this.errorDescription[this.errorCodes.ASN1_ERROR] = "Ошибка декодирования ASN1 структуры";
    },

    /**
     * функция опрашивает инфомрацию о доступных устройствах
     * @param resultCallback функция обратного вызова, в которую передается устроуйств.
     * @param errorCallback
     */
    refreshDevicesInfo: function(resultCallback, errorCallback) {
        var plugin = this;
        var devicesHash = {};

        // запросим списк устройств
        this.pluginObject.enumerateDevices(
            enumerateCallback,
            errorCallback
        );

        // функция вызывает загрузку объектов устройств
        function enumerateCallback(deviceIDs) {
            $.each(deviceIDs, function (i, deviceID) {
                // создадим устройство, при этом будет запущена подгрузка данных по нему
                device = new CryptoDevice({
                    id: deviceID,
                    plugin: plugin,
                    initResultCallback: checkAllDevicesReady,
                    initErrorCallback: errorCallback
                });
                devicesHash[deviceID] = device;
            })
        }


        /**
         * Функция проверяет вся ди инфа об устроствах загружена.
         * Как только загрузка завершена, вызывается колбек
         */
        function checkAllDevicesReady() {
            var allReady = true;

            // сбросим флаг если хоть одно из устройств еще не прогрузилось
            $.each(devicesHash, function (i, device) {
                if (!device.is_inited()) allReady = false;
            });


            if (allReady) {
                // упорядочим устройства по ID
                var devices = [];
                for (k in devicesHash) {
                    if (devicesHash.hasOwnProperty(k)) {
                        devices.push(devicesHash[k]);
                    }
                }
                plugin.devices = devices.sort(function(a,b){ return Number(a.id) - Number(b.id) })

                // обработчик окончания обновления списка устройств
                resultCallback(plugin.devices)
            }
        }
    }
};

