function CryptoKey(param) {
    this.id = param.id;
    this.device = param.device;

    this._init(param.initResultCallback, param.initErrorCallback);
}
CryptoKey.prototype = {
    id: null,
    label: null,
    device: null,

    /**
     * метод проверят окончена ли стартовая инициализация объекта
     */
    is_inited: function() {
        var inited = true;

        // если одно из стартовых свойств еще не прогружено, снимем флаг
        if (!this.label) inited = false;

        return inited;
    },

    /**
     * метод инициализирует объект ключа
     */
    _init: function(resultCallback, errorCallback) {
        var key = this;

        // label
        key.device.plugin.pluginObject.getKeyLabel(
            key.device.id,
            key.id,
            function(label) {
                key.label = label;
                checkReady();
            },
            errorCallback
        );

        /**
         * проверка окончания инициализационных операций
         */
        function checkReady() {
            if (resultCallback && key.is_inited())
                resultCallback(key);
        }
    },

    createRequest: function(){

    }
};