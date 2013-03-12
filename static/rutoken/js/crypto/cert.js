/**
 * Конструктор сертификатов
 * @param param - параметры:
 *      id - идентификатор сертификата
 *      deviceID - идентификатор устройства
 *      category - категория сертификата ("user", "other" или "ca")
 *      plugin - объект CryptoPlugin
 *      initResultCallback - обработчик окончания инициализации сертификата. В него передается объект сертификата.
 *      initErrorCallback - обработчик ошибок инициализации сертификата.
 * @constructor
 */
function CryptoCert(param) {
    this.id = param.id;
    this.deviceID = param.deviceID;
    this.category = param.category;
    this.plugin = param.plugin;

    this.init(param.initResultCallback, param.initErrorCallback);
}
CryptoCert.prototype = {
    id: null,
    deviceID: null,
    category: null,
    plugin: null,

    info: null,             // распарсенная инфомрация о сертификате в том виде, как возвращает плагин токена
    text: null,             // текст сертификата целиком

    serialNumber: null,     // номер сертификата (уникальный в пределах удостоверяющего центра)
    issuer: null,           // инфа по сертификату УЦ
    subject: null,          // инфа по владельцу сертификата

    // диапазон валидности сертификата в виде ISO строки ("2014-03-05T07:33:30Z")
    validNotAfter: null,
    validNotBefore: null,

    categoryNames: {
        user: "Пользовательский",
        ca: "Корневой",
        other: "Другой"
    },

    /**
     * метод проверят окончена ли стартовая инициализация объекта
     */
    is_inited: function() {
        var inited = true;

        if (!this.info) inited = false;

        return inited;
    },


    /**
     * метод инициализирует объект устройства
     */
    init: function(resultCallback, errorCallback) {
        var cert = this;

        // запросим распарсенную инфу о сертификате
        this.plugin.pluginObject.parseCertificate(
            cert.deviceID,
            cert.id,
            parseResultCallback,
            errorCallback
        );



        /**
         * обрабочик сохраняет полученные данные с токена в объект сертификата
         * @param info - ассоциативный массив объектов с инфой по сертификату
         */
        function parseResultCallback(info) {
            cert.info = info;
            cert.serialNumber = info.serialNumber;
            cert.text = info.text;
            cert.validNotAfter = info.validNotAfter;
            cert.validNotBefore = info.validNotBefore;

            cert.subject = {};
            for (var i=0; i < info.subject.length; i++)
                cert.subject[info.subject[i].rdn] = info.subject[i].value;

            cert.issuer = {};
            for (i=0; i < info.issuer.length; i++)
                cert.issuer[info.issuer[i].rdn] = info.issuer[i].value;

            checkReady();
        }

        /**
         * проверка окончания инициализационных операций
         */
        function checkReady() {
            if (resultCallback && cert.is_inited())
                resultCallback(cert);
        }
    },

    getLabel: function() {
        var categoryName = this.categoryNames[this.category];
        var commonName = this.subject.commonName;
        var emailAddress = this.subject.emailAddress;
        return  commonName +': '+ emailAddress +' ('+ categoryName +') ';
    }

};