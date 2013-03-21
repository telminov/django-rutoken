$(function (){
    var URL_PEM_REQUEST_MODAL = '/rutoken/pem_request_modal/'; //TODO: надо как-то пробросить из настроек. Сейчас предполагается, что прилоение rutoken подключено с префиксом rutoken в урле

    prepareRequestGenerator();


    /**
     * функция навешивает на форму логику генерации запросов на сертификат
     */
    function prepareRequestGenerator() {

        // нарисуем список устройств и кнопку генерации запроса
        var pemText = $('.pem_text');
        var pemGenButton = $('<input type="button" id="pem_text_gen_button" value="Сгенерировать"/>').insertAfter(pemText);
        // окно генерации
        pemGenButton.click(openPopup);


        /**
         * вся логика генерации pem-кода запроса в отдельном окне
         */
        function openPopup() {
            var popup = window.open(URL_PEM_REQUEST_MODAL, '', 'width=700,height=400');
            popup.onload = popupLoadHandler;


            /**
             * основная логика работы с токеном
             */
            function popupLoadHandler(){
                var devicesSelect = $(popup.document).find('#devices'),
                    showPinBtn = $(popup.document).find('#show_pin'),
                    pinGroup = $(popup.document).find('.pin_group'),
                    pinInput = $(popup.document).find('#pin_input'),
                    loginBtn = $(popup.document).find('#login'),
                    keysSelect = $(popup.document).find('#keys'),
                    addKeyBtn = $(popup.document).find('#add_key'),
                    pemText = $(popup.document).find('#pem_text'),
                    genRequestBtn = $(popup.document).find('#gen_request'),
                    closeBtn = $(popup.document).find('.close_btn'),
                    submitBtn = $(popup.document).find('.submit_btn'),
                    form = $(popup.document).find('form');

                // обработка сабмита формы
                form.submit(submitHandler);

                // закрытие окна
                closeBtn.click(function() {popup.close()});

                // заблокируем до времени все лишнее
                showPinBtn.attr('disabled', 'disabled');
                keysSelect.attr('disabled', 'disabled');
                addKeyBtn.attr('disabled', 'disabled');
                pemText.attr('disabled', 'disabled');
                genRequestBtn.attr('disabled', 'disabled');
                submitBtn.attr('disabled', 'disabled');

                // запросим инфу по устройствам
                var crypto_ui = new CryptoUI({
                    createPluginObject: true,
                    contentBox: form,
                    devicesSelect: devicesSelect,
                    keysSelect: keysSelect
                });
                crypto_ui.refreshDevices(devicesRefreshCallback);


                /**
                 * по результатам подгрузки устройств
                 */
                function devicesRefreshCallback() {
                    // если устройств нет, прекратим работу
                    if (!crypto_ui.plugin.devices.length) {
                        crypto_ui.errorReport(['Не обнаружено подключенных устройств.']);
                        return;
                    }

                    // обработчик выбора устройства
                    devicesSelect.change(deviceSelectHandler);
                    deviceSelectHandler();
                }

                /**
                 * обработчик выбора устройства
                 */
                function deviceSelectHandler() {
                    var device = crypto_ui.plugin.getDeviceByID(devicesSelect.val());

                    // если готовы к работе с устройством
                    if (device.is_login) {
                        // заблокируем кнопку логина, чтоб не отвлекала пользователя
                        showPinBtn.attr('disabled', 'disabled');

                        // обновим список ключей
                        crypto_ui.refreshKeys(devicesSelect.val(), keysRefreshCallback);

                    // если на устройстве еще не залогинены предоставим возможность залогинится
                    } else {
                        showPinBtn.click(loginInSelectedDevice);
                        showPinBtn.removeAttr('disabled');
                        showPinBtn.focus();
                    }
                }


                /**
                 * логин на устройства
                 */
                function loginInSelectedDevice() {
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

                        crypto_ui.refreshKeys(devicesSelect.val(), keysRefreshCallback);
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


                /**
                 * по результатам подгрузки ключей
                 */
                function keysRefreshCallback(keys) {
                    keysSelect.removeAttr('disabled');
                    addKeyBtn.removeAttr('disabled');

                    if (keys.length) {
                        pemText.removeAttr('disabled');
                        genRequestBtn.removeAttr('disabled');
                        genRequestBtn.focus();
                        genRequestBtn.click(generateRequest);
                    } else {
                        genRequestBtn.unbind('click');
                        pemText.attr('disabled', 'disabled');
                        genRequestBtn.attr('disabled', 'disabled');
                    }
                }

                /**
                 * передает на устройства данные для генерации сертификата
                 * и заполняет текстовое поле полученным кодом PEM-запроса
                 */
                function generateRequest() {

                }


                /**
                 * обработчик закрытия окна
                 * @param event
                 */
                function submitHandler(event) {
                    event.preventDefault();
                    popup.close();
                }
            }

        }
    }





});