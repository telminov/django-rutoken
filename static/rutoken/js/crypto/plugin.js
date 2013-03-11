/**
 * Обертка с дополнительными методами для манипулации с токеном
 * @constructor
 */
function CryptoPlugin() {
    this.pluginObject = document.getElementById("plugin-object");
    this.init();
}
CryptoPlugin.prototype = {
    pluginObject: null,
    errorCodes: null,
    errorDescription: [],

    is_valid: function(){
        return this.pluginObject && this.pluginObject.valid
    },

    init: function() {
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
     * @param resultCallback функция обратного вызова, в которую передается отсортированный список идентификаторов устроуйств и словарь с устройствами (ключ - идентификатор).
     * @param errorCallback
     */
    refreshDevicesInfo: function(resultCallback, errorCallback) {
        var crypto = this;
        crypto.devices = {};

        // запросим списк устройств
        this.pluginObject.enumerateDevices(
            enumerateCallback,
            errorCallback
        );

        // функция вызывает загрузку объектов устройств
        function enumerateCallback(deviceIDs) {
            $.each(deviceIDs, function (i, deviceID) {
                device = new CryptoDevice(deviceID, crypto, checkAllDevicesReady, errorCallback);
                crypto.devices[deviceID] = device;
            })
        }


        /**
         * Функция проверяет вся ди инфа об устроствах загружена.
         * Как только загрузка завершена, вызывается колбек
         */
        function checkAllDevicesReady() {
            var allReady = true;

            $.each(crypto.devices, function (i, device) {
                if (!device.is_inited()) allReady = false;
            });

            if (allReady)
                resultCallback(
                    crypto.getDeviceIDs(),
                    crypto.devices
                );
        }
    },

    /**
     * @returns {Array} - сортированный список устройств
     */
    getDeviceIDs: function() {
        if (!this.devices)
            throw "Нет информации об устройствах. Возможно следует сначала вызывать метод refreshDevicesInfo.";

        var deviceIDs = [];
        // сформируем массив идентификаторов
        for (k in this.devices) {
            if (this.devices.hasOwnProperty(k)) {
                deviceIDs.push(Number(k));
            }
        }
        // отсортируем его
        deviceIDs = deviceIDs.sort(function(a,b){ return Number(a)-Number(b) });

        return deviceIDs;
    }
};

