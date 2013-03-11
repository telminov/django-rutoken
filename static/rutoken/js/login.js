$(function(){
    var devicesSelect = $('#id_devices');
    var keysSelect = $('#id_keys');
    var certsSelect = $('#id_certs');
    var pinBtn = $('#id_pin');
    var submitBtn = $('form button[type=submit]');

    var crypto_ui = new CryptoUI({
        contentBox: '.box-container-toggle',
        devicesSelect: devicesSelect
    });

    // заблокируем до времени не нужные элементы формы
    keysSelect.attr('disabled', 'disabled');
    certsSelect.attr('disabled', 'disabled');
    pinBtn.attr('disabled', 'disabled');
    submitBtn.attr('disabled', 'disabled');

    // модальное окно для ввода pin-кода
    pinBtn.click(function(){
        var loginModal = $('#loginPINModal');
        crypto_ui.login(loginModal);
    });

    crypto_ui.refreshDevices(deviceRefreshCallback);



    /**
     * обработчик успешного окончания обновлнеия списка устройств
     */
    function deviceRefreshCallback() {
        var selectedDeviceID = devicesSelect.val();

        if (!selectedDeviceID) return;  // если не оказалось устройств

        pinBtn.removeAttr('disabled');
        pinBtn.focus();
    }


    /**
     * логик на рутокен
     */

});

