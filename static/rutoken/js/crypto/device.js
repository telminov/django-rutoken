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
    this.keys = null;
    this.certificates = {'user': null, 'ca': null, 'other': null};

    this.init(initResultCallback, initErrorCallback);
}
CryptoDevice.prototype = {

    /**
     * метод проверят окночена ли стартовая инициализация
     */
    is_inited: function() {
        var inited = true;

        // если одно из стартовых свойств еще не прогружено, снимем флаг
        if (!this.label) inited = false;
        if (!this.model) inited = false;
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
    }
};
