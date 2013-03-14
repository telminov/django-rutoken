$(function (){
    prepareRequestGenerator();


    /**
     * функция навешивает на форму логику генерации запросов на сертификат
     */
    function prepareRequestGenerator() {

        // нарисуем список устройств и кнопку генерации запроса
        var pemText = $('.pem_text');
        var deviceSelect = $('<select id="crypto_devices"></select>').insertAfter(pemText);
        var pemGenButton = $('<input type="button" id="pem_text_gen_button" value="Сгенерировать" disabled="disabled"/>').insertAfter(deviceSelect);

        // запросим инфу по устройствам
        var crypto_ui = new CryptoUI({
            createPluginObject: true,
            contentBox: '#content-main',
            devicesSelect: deviceSelect
        });
        crypto_ui.refreshDevices(deviceRefreshCallback);


        /**
         * по результатам подгрузки инфы подготовим кнопку генерации запроса
         */
        function deviceRefreshCallback() {
            // если устройств нет, прекратим работу
            if (!crypto_ui.plugin.devices.length)
                return;

            pemGenButton.removeAttr('disabled');
            pemGenButton.click(pemGenerate);
        }

        /**
         * генерации pem-кода запроса
         */
        function pemGenerate() {
            var selectedDeviceID = deviceSelect.val();



        }

    }
});