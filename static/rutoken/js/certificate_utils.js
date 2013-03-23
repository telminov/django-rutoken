/**
 * логин на устройства
 */
function loginInSelectedDevice(devicesSelect, pinGroup, pinInput, loginBtn, showPinBtn, popup, crypto_ui, loginCallback) {
    var device = crypto_ui.plugin.getDeviceByID(devicesSelect.val());
    pinGroup.show();
    pinInput.focus();
    loginBtn.removeAttr('disabled');

    // повесим обработчики ввода пароля
    loginBtn.click(pinHandler);
    pinInput.keypress(
        function(e){
            if (e.keyCode == 13)        // ввод Enter
                pinHandler()
        }
    );

    /**
     * обработчик ввода PIN-кода
     */
    function pinHandler(){
        var pin = pinInput.val();
        device.login(pin, loginHandler, errorHandler);
    }

    /**
     * обработчик успешного входа
     */
    function loginHandler() {
        // уберем обработчики
        loginBtn.unbind('click');
        pinInput.unbind('keypress');

        // скроем кнопки
        showPinBtn.attr('disabled', 'disabled');
        loginBtn.attr('disabled', 'disabled');
        pinGroup.hide();

        // уберем сообщения об ошибках, если были
        $(popup.document).find('.alert').remove();

        loginCallback();
    }

    /**
     * обработчик ошибки входа
     * @param errorCode
     */
    function errorHandler(errorCode) {
        crypto_ui.errorCallback(errorCode);
        pinInput.select();
    }
}