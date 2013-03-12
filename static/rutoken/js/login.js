$(function(){
    var devicesSelect = $('#id_devices');
    var certsSelect = $('#id_certs');
    var pinBtn = $('#id_pin');
    var submitBtn = $('form button[type=submit]');

    var crypto_ui = new CryptoUI({
        contentBox: '.box-container-toggle',
        devicesSelect: devicesSelect,
        certsSelect: certsSelect
    });

    // заблокируем до времени не нужные элементы формы
    certsSelect.attr('disabled', 'disabled');
    pinBtn.attr('disabled', 'disabled');
    submitBtn.attr('disabled', 'disabled');

    // модальное окно для ввода pin-кода
    pinBtn.click(openPINModal);

    crypto_ui.refreshDevices(deviceRefreshCallback);



    /**
     * окно ввода пин кода
     */
    function openPINModal(){
        crypto_ui.login({
            loginModal: $('#loginPINModal'),
            pinSuccessCallback: pinSuccessCallback
        });

        /**
         * после успешного ввода пина ломимся на сервер
         */
        function pinSuccessCallback(){
            submitBtn.removeAttr('disabled', 'disabled');
            submitBtn.click(function (event) {
                event.preventDefault();
                authToServer();
            });

            authToServer();
        }
    }

    /**
     * обработчик успешного окончания обновлнеия списка устройств
     */
    function deviceRefreshCallback() {
        var selectedDeviceID = devicesSelect.val();

        if (!selectedDeviceID) return;  // если не оказалось устройств

        pinBtn.removeAttr('disabled');
        certsSelect.removeAttr('disabled');
        pinBtn.focus();
    }


    /**
     * метод инициирует вход на сервер по выбранному в текущий момент сертификату
     */
    function authToServer() {
        var selectedDeviceID = devicesSelect.val();
        var selectedCertID = certsSelect.val();

        // если выбрано устройство и сертификат
        if (selectedDeviceID && selectedCertID) {
            var device = crypto_ui.plugin.getDeviceByID(selectedDeviceID);
            var cert = device.getCertByID(selectedCertID);
            var serverRandom = $('#server_random').text();

            cert.genAuthToken(
                serverRandom,
                authCallback,
                function(errorCode) {crypto_ui.errorCallback(errorCode)}
            )
        }

        function authCallback(authToken) {
            alert(authToken);
        }
    }
});
