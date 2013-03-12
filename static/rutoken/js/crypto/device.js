/**
 * Конструктор устройств СКЗИ
 * @param param - параметры:
 *      id - идентификатор устройства
 *      plugin - объект CryptoPlugin
 *      initResultCallback - обработчик окончания инициализации устройства. В него передается объект устройства.
 *      initErrorCallback - обработчик ошибок инициализации устройства.
 * @constructor
 */
function CryptoDevice(param) {
    this.id = param.id;
    this.plugin = param.plugin;

    this.init(param.initResultCallback, param.initErrorCallback);
}
CryptoDevice.prototype = {
    id: null,
    plugin: null,
    label: null,
    model: null,
    type: null,
    keys: null,
    certs: {'user': null, 'ca': null, 'other': null},

    /**
     * метод проверят окончена ли стартовая инициализация объекта
     */
    is_inited: function() {
        var inited = true;

        // если одно из стартовых свойств еще не прогружено, снимем флаг
        if (!this.label) inited = false;
        if (!this.model) inited = false;
        if (!this.type) inited = false;
        if (!this.certs['user']) inited = false;
        if (!this.certs['ca']) inited = false;
        if (!this.certs['other']) inited = false;
        // проверим еще что все сертификаты инициализированны
        $(this.getAllCerts(), function(i, cert) {
            if (!cert.is_inited())
                inited = false;
        });


        return inited;
    },

    /**
     * метод инициализирует объект устройства
     */
    init: function(resultCallback, errorCallback) {
        var device = this;

        // label
        this.plugin.pluginObject.getDeviceLabel(
            device.id,
            function(label) {
                if (label == "Rutoken ECP <no label>") label = "Rutoken ECP #" + device.id;
                device.label = label;
                checkReady();
            },
            errorCallback
        );

        // модель
        this.plugin.pluginObject.getDeviceModel(
            device.id,
            function(model) {
                device.model = model;
                checkReady();
            },
            errorCallback
        );

        // тип
        this.plugin.pluginObject.getDeviceType(
            device.id,
            function(type) {
                switch (type)
                {
                    case device.plugin.pluginObject['TOKEN_TYPE_UNKNOWN']:
                        device.type = "Неизвестное устройство";
                        break;
                    case device.plugin.pluginObject['TOKEN_TYPE_RUTOKEN_ECP']:
                        device.type = "Рутокен ЭЦП";
                        break;
                    case device.plugin.pluginObject['TOKEN_TYPE_RUTOKEN_WEB']:
                        device.type = "Рутокен Web";
                        break;
                    case device.plugin.pluginObject['TOKEN_TYPE_RUTOKEN_PINPAD_IN']:
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
        this.plugin.pluginObject.enumerateCertificates(
            device.id,
            this.plugin.pluginObject['CERT_CATEGORY_USER'],
            function(certs) {
                setCerts(certs, 'user');
            },
            errorCallback
        );
        // сертификаты удостоверяющего центра
        this.plugin.pluginObject.enumerateCertificates(
            device.id,
            this.plugin.pluginObject['CERT_CATEGORY_CA'],
            function(certs) {
                setCerts(certs, 'ca');
            },
            errorCallback
        );
        // сертификаты другие
        this.plugin.pluginObject.enumerateCertificates(
            device.id,
            this.plugin.pluginObject['CERT_CATEGORY_OTHER'],
            function(certs) {
                setCerts(certs, 'other');
            },
            errorCallback
        );

        /**
         * функция устанавливает список объектов сертификатов по заданной категории на объект устройства
         * @param certs - массив строк с идентификаторами сертификатов
         * @param category - категория сертификата ("user", "other" или "ca")
         */
        function setCerts(certs, category) {
            device.certs[category] = [];

            for (var i=0; i < certs.length; i++) {
                var cert = new CryptoCert({
                    id: certs[i],
                    deviceID: device.id,
                    category: category,
                    plugin: device.plugin,
                    initErrorCallback: errorCallback,
                    initResultCallback: function() {
                        // по окончании инициализации сертификата проверим не оконченали теперь инцииализация устройства в целом
                        checkReady();
                    }
                });
                // добавим созданный, но еще не окончевший инициализации сертификат
                device.certs[category].push(cert);
            }
        }

        /**
         * проверка окончания инициализационных операций
         */
        function checkReady() {
            if (resultCallback && device.is_inited())
                resultCallback(device);
        }
    },

    /**
     * вход на устройство
     * @param pin
     * @param resultCallback
     * @param errorCallback
     */
    login: function(pin, resultCallback, errorCallback) {
        this.plugin.pluginObject.login(
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
        var device = this;
        this.plugin.pluginObject.enumerateKeys(
            device.id,
            "",
            function(keys) {
                device.keys = keys;
                resultCallback(keys);
            },
            errorCallback
        );
    },

    /**
     * @returns {Array} - список всех сертификатов на устройстве
     */
    getAllCerts: function() {
        var certs = [];

        if (this.certs['user'])
            for (var i=0; i < this.certs['user'].length; i++)
                certs.push(this.certs['user'][i]);

        if (this.certs['ca'])
            for (i=0; i < this.certs['ca'].length; i++)
                certs.push(this.certs['ca'][i]);

        if (this.certs['other'])
            for (i=0; i < this.certs['other'].length; i++)
                certs.push(this.certs['other'][i]);

        return certs;
    },

    /**
     * формирует развернутое описание устройства
     * @returns {string}
     */
    getExpandLabel: function() {
        return this.label + ' ('+ this.type +')';
    }
};
