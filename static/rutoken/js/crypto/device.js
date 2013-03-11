/**
 * Устройство СКЗИ
 * @param id - идентификатор устройства
 * @param crypto - объект CryptoPlugin
 * @param initResultCallback - обработчик окончания инициализации устройства. В него передается объект устройства.
 * @param initErrorCallback - обработчик ошибок инициализации устройства.
 * @constructor
 */
function CryptoDevice(id, crypto, initResultCallback, initErrorCallback) {
    this.id = id;
    this.crypto = crypto;
    this.label = null;
    this.model = null;
    this.type = null;
    this.keys = null;
    this.certificates = {'user': null, 'ca': null, 'other': null};

    this.init(initResultCallback, initErrorCallback);
}
CryptoDevice.prototype = {

    /**
     * метод проверят окончена ли стартовая инициализация объекта
     */
    is_inited: function() {
        var inited = true;

        // если одно из стартовых свойств еще не прогружено, снимем флаг
        if (!this.label) inited = false;
        if (!this.model) inited = false;
        if (!this.type) inited = false;
        if (!this.certificates['user']) inited = false;
        if (!this.certificates['ca']) inited = false;
        if (!this.certificates['other']) inited = false;

        return inited;
    },

    /**
     * метод инициализирует объект устройства
     */
    init: function(resultCallback, errorCallback) {
        var device = this;

        // label
        this.crypto.pluginObject.getDeviceLabel(
            device.id,
            function(label) {
                if (label == "Rutoken ECP <no label>") label = "Rutoken ECP #" + device.id;
                device.label = label;
                checkReady();
            },
            errorCallback
        );

        // модель
        this.crypto.pluginObject.getDeviceModel(
            device.id,
            function(model) {
                device.model = model;
                checkReady();
            },
            errorCallback
        );

        // тип
        this.crypto.pluginObject.getDeviceType(
            device.id,
            function(type) {
                switch (type)
                {
                    case device.crypto.pluginObject['TOKEN_TYPE_UNKNOWN']:
                        device.type = "Неизвестное устройство";
                        break;
                    case device.crypto.pluginObject['TOKEN_TYPE_RUTOKEN_ECP']:
                        device.type = "Рутокен ЭЦП";
                        break;
                    case device.crypto.pluginObject['TOKEN_TYPE_RUTOKEN_WEB']:
                        device.type = "Рутокен Web";
                        break;
                    case device.crypto.pluginObject['TOKEN_TYPE_RUTOKEN_PINPAD_IN']:
                        device.type = "Рутокен PINPad";
                        break;
                    default:
                        device.type = "Невозможно определить тип устройства";
                }

                checkReady();
            },
            errorCallback
        );

        // сертификаты пользовательские
        this.crypto.pluginObject.enumerateCertificates(
            device.id,
            this.crypto.pluginObject['CERT_CATEGORY_USER'],
            function(certs) {
                device.certificates['user'] = certs;
                checkReady();
            },
            errorCallback
        );
        // сертификаты удостоверяющего центра
        this.crypto.pluginObject.enumerateCertificates(
            device.id,
            this.crypto.pluginObject['CERT_CATEGORY_CA'],
            function(certs) {
                device.certificates['ca'] = certs;
                checkReady();
            },
            errorCallback
        );
        // сертификаты другие
        this.crypto.pluginObject.enumerateCertificates(
            device.id,
            this.crypto.pluginObject['CERT_CATEGORY_OTHER'],
            function(certs) {
                device.certificates['other'] = certs;
                checkReady();
            },
            errorCallback
        );


        /**
         * проверка окончания инициализационных операций
         */
        function checkReady() {
            if (resultCallback && device.is_inited())
                resultCallback(this);
        }
    },

    /**
     * вход на устройство
     * @param pin
     * @param resultCallback
     * @param errorCallback
     */
    login: function(pin, resultCallback, errorCallback) {
        this.crypto.pluginObject.login(
            this.id,
            pin,
            resultCallback,
            errorCallback
        )
    },

    /**
     * TODO: набросок работы с ключами
     * @param resultCallback
     * @param errorCallback
     */
    refreshKeys: function(resultCallback, errorCallback) {
        crypto.pluginObject.enumerateKeys(
            deviceID,
            "",
            function(keys) {
                crypto.devicesInfo[deviceID]['keys'] = keys;
            },
            errorCallback
        );
    },

    /**
     * формирует развернутое описание устройства
     * @returns {string}
     */
    getExpandLabel: function() {
        return this.label + ' ('+ this.type +')';
    }
};
