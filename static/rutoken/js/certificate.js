$(function(){
    var URL_PEM_CERT_POPUP = '/rutoken/pem_cert_popup/'; //TODO: надо как-то пробросить из настроек. Сейчас предполагается, что прилоение rutoken подключено с префиксом rutoken в урле

    prepareForm();



    /**
     * функция определяет доступность полей формы
     */
    function prepareForm() {
        var isNew = window.location.pathname.endsWith('add/');

        // для нового сертификата блокируем все инпуты кроме запроса и пользователя
        if (isNew) {
            $('#id_serial_number, #id_pem_text').attr('disabled','disabled');
            $('#id_request').focus();

        // если сертификат существует, предоставим возможность импорта на ключ
        } else {
            prepareCertImport();
        }
    }

    /**
     * подготовка импорта сертификатов
     */
    function prepareCertImport() {
        // нарисуем кнопку импорта
        var pemCertText = $('#id_pem_text');
        var pemImportButton = $('<input type="button" id="pem_text_import_button" value="Импортировать"/>').insertAfter(pemCertText);
        // окно импорта
        pemImportButton.click(openPopup);


        /**
         * вся логика импорта сертификата в отдельном окне
         */
        function openPopup() {
            var popup = window.open(URL_PEM_CERT_POPUP, '', 'width=1000,height=500');
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
                    pemText = $(popup.document).find('#pem_text'),
                    closeBtn = $(popup.document).find('.close_btn'),
                    submitBtn = $(popup.document).find('.submit_btn'),
                    form = $(popup.document).find('form');


                // обработка сабмита формы
                form.submit(submitHandler);

                // закрытие окна
                closeBtn.click(function() {popup.close()});

                // заблокируем до времени все лишнее
                showPinBtn.attr('disabled', 'disabled');
                pemText.attr('disabled', 'disabled');
                submitBtn.attr('disabled', 'disabled');

                // всавим текст сертификата
                pemText.val(
                    pemCertText.val()
                );

                // запросим инфу по устройствам
                var crypto_ui = new CryptoUI({
                    createPluginObject: true,
                    contentBox: form,
                    devicesSelect: devicesSelect
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

                        pemText.removeAttr('disabled');
                        submitBtn.removeAttr('disabled').focus();

                    // если на устройстве еще не залогинены предоставим возможность залогинится
                    } else {
                        showPinBtn.click(function(){
                            loginInSelectedDevice(devicesSelect, pinGroup, pinInput, loginBtn, showPinBtn, popup, crypto_ui, loginCallback)
                        });
                        showPinBtn.removeAttr('disabled');
                        showPinBtn.focus();
                    }
                }


                /**
                 * обработчик успешного входа
                 */
                function loginCallback() {
                    pemText.removeAttr('disabled');
                    submitBtn.removeAttr('disabled').focus();
                }


                /**
                 * обработчик закрытия окна
                 * @param event
                 */
                function submitHandler(event) {
                    event.preventDefault();

                    var device = crypto_ui.plugin.getDeviceByID(devicesSelect.val());
                    var certPem = pemText.val();
                    console.log("device=", device);
                    device.importCertificate(
                        certPem,
                        importCallback,
                        function(errorCode) {
                            crypto_ui.errorCallback(errorCode)
                        }
                    );

                    function importCallback(cert) {
                        popup.close();
                    }
                }


            }
        }
    }

});

