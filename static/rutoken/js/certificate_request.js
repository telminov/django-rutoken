$(function (){
    var URL_PEM_REQUEST_POPUP = '/rutoken/pem_request_popup/'; //TODO: надо как-то пробросить из настроек. Сейчас предполагается, что прилоение rutoken подключено с префиксом rutoken в урле

    prepareRequestGenerator();
    prepareInputChangeHandler();

    /**
     * если меняется значение какого-нибудь из волей ввод, сбрасываем значение сертификата,
     * так как оно генерится на основание значений полей
     */
    function prepareInputChangeHandler(){
        $('input[type=text]').change(function(){
            $('.pem_text').val('');
        })
    }


    /**
     * функция навешивает на форму логику генерации запросов на сертификат
     */
    function prepareRequestGenerator() {

        // нарисуем кнопку генерации запроса
        var pemText = $('.pem_text');
        var pemGenButton = $('<input type="button" id="pem_text_gen_button" value="Сгенерировать"/>').insertAfter(pemText);
        // окно генерации
        pemGenButton.click(openPopup);


        /**
         * вся логика генерации pem-кода запроса в отдельном окне
         */
        function openPopup() {
            var popup = window.open(URL_PEM_REQUEST_POPUP, '', 'width=1000,height=500');
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
                    crypto_ui.refreshKeys(devicesSelect.val(), keysRefreshCallback);
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
                        submitBtn.unbind('click');
                        pemText.attr('disabled', 'disabled');
                        genRequestBtn.attr('disabled', 'disabled');
                        submitBtn.attr('disabled', 'disabled');
                    }
                }

                /**
                 * передает на устройства данные для генерации сертификата
                 * и заполняет текстовое поле полученным кодом PEM-запроса
                 */
                function generateRequest() {
                    var subject = [];
                    var subjectFieldMap = {
                        countryName: '#id_country',
                        stateOrProvinceName: '#id_state',
                        localityName: '#id_locality',
                        organizationName: '#id_org_name',
                        organizationalUnitName: '#id_org_unit',
                        commonName: '#id_common_name',
                        surname: '#id_surname',
                        givenName: '#id_given_name',
                        emailAddress: '#id_email',
                        title: '#id_title',
                        streetAddress: '#id_street_address',
                        postalAddress: '#id_postal_address',
                        INN: '#id_inn',
                        SNILS: '#id_snils',
                        OGRN: '#id_ogrn'
                    };

                    $.each(subjectFieldMap, function(subjectName) {
                        var fieldSelector = subjectFieldMap[subjectName];
                        var value = $(fieldSelector).val();
                        if (value)
                            subject.push({
                                rdn: subjectName,
                                value: value
                            })
                    });

                    var extensions = {
                        keyUsage:     [],
                        extKeyUsage:  [],
                        certificatePolicies: []
                    };

                    var device = crypto_ui.plugin.getDeviceByID(devicesSelect.val());
                    var key = device.getKeyByID(keysSelect.val());
                    key.createRequest(
                        subject,
                        extensions,
                        requestHandler,
                        errorHandler
                    );


                    /**
                     * обработка успешной генерации
                     * @param pem
                     */
                    function requestHandler(pem) {
                        pemText.val(pem);

                        // уберем сообщения об ошибках, если были
                        $(popup.document).find('.alert').remove();

                        submitBtn.removeAttr('disabled');
                        submitBtn.click(submitHandler);
                        submitBtn.focus();
                    }

                    function errorHandler(errorCode) {
                        crypto_ui.errorCallback(errorCode);
                    }
                }


                /**
                 * обработчик закрытия окна
                 * @param event
                 */
                function submitHandler(event) {
                    event.preventDefault();
                    popup.close();

                    // обновим значение текста запроса в форме
                    var pem = pemText.val();
                    $('#id_pem_text').val(pem);

                    // установим фокус на сохранение формы
                    $('input[type=submit][name=_save]').focus();
                }
            }
        }
    }
});